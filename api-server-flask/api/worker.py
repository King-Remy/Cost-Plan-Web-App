##################################################################################
#                                                                                #
# Copyright (c) 2020 AECgeeks                                                    #
#                                                                                #
# Permission is hereby granted, free of charge, to any person obtaining a copy   #
# of this software and associated documentation files (the "Software"), to deal  #
# in the Software without restriction, including without limitation the rights   #
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      #
# copies of the Software, and to permit persons to whom the Software is          #
# furnished to do so, subject to the following conditions:                       #
#                                                                                #
# The above copyright notice and this permission notice shall be included in all #
# copies or substantial portions of the Software.                                #
#                                                                                #
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     #
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       #
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    #
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         #
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  #
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  #
# SOFTWARE.                                                                      #
#                                                                                #
##################################################################################

import os
import sys
import json
import glob
import platform
import traceback
import importlib
import subprocess
import tempfile
import operator
import itertools
import shutil

from multiprocessing import Process

class ifcopenshell_file_dict(dict):
    def __missing__(self, key):
        import ifcopenshell
        self[key] = ifcopenshell.open(utils.storage_file_for_id(key, 'ifc'))
        return self[key]

import requests

import utils
import config
import models

print(f"Using {config.num_threads} threads per worker")

on_windows = platform.system() == 'Windows'

def set_progress(id, progress):
    session = models.Session()
   
    id = id.split("_")[0]

    model = session.query(models.Model).filter(models.Model.code == id).all()[0]
    model.progress = int(progress)
    session.commit()
    session.close()


class task(object):
    def __init__(self, id, progress_map):
        import inspect
        print(self.__class__.__name__, inspect.getfile(type(self)), *progress_map)
        self.id = id
        self.begin, self.end = progress_map

    def sub_progress(self, i):
        set_progress(self.id, self.begin + (self.end - self.begin) * i / 100.)

    def __call__(self, *args):
        self.execute(*args)
        self.sub_progress(100)


class ifc_validation_task(task):
    est_time = 1

    def execute(self, context, id):
        import ifcopenshell.validate
        
        logger = ifcopenshell.validate.json_logger()
        f = context.models[id]
        
        ifcopenshell.validate.validate(f, logger)
                
        with open(os.path.join(context.directory, "log.json"), "w") as f:
            print("\n".join(json.dumps(x, default=str) for x in logger.statements), file=f)

class task_execution_context:
  
  def __init__(self, id):
      self.id = id
      self.directory = utils.storage_dir_for_id(id)
      self.input_files = [name for name in os.listdir(self.directory) if os.path.isfile(os.path.join(self.directory, name)) and name.endswith(".ifc")]
      self.models = ifcopenshell_file_dict()
  
      tasks = [
          ifc_validation_task,
      ]
      
      self.is_multiple = any("_" in n for n in self.input_files)
      
      self.n_files = len(self.input_files)
      
      self.input_ids = ["%s_%d" % (self.id, i) if self.is_multiple else self.id for i in range(self.n_files)]
      
      self.tasks = list(filter(config.task_enabled, tasks))

      self.tasks.sort(key=lambda t: getattr(t, 'order', 10))

  def run(self):
      elapsed = 0
      set_progress(self.id, elapsed)
      
      total_est_time = sum(map(operator.attrgetter('est_time'), self.tasks)) * self.n_files
          
      def run_task(t, *args):
          nonlocal elapsed
          begin_end = (elapsed / total_est_time * 99, (elapsed + t.est_time) / total_est_time * 99)
          task = t(self.id, begin_end)
          try:
              task(self, *args)
          except:
              traceback.print_exc(file=sys.stdout)
              # Mark ID as failed
              with open(os.path.join(self.directory, 'failed'), 'w') as f:
                  pass
              return False
          elapsed += t.est_time
          return True

      with_failure = False
              
      for t, ii in itertools.product(self.tasks, self.input_ids):
          if not run_task(t, ii):
              with_failure = True
              break

      elapsed = 100
      set_progress(self.id, elapsed) 


def do_process(id):
    tec = task_execution_context(id)
    # for local development
    # tec.run()

    p = Process(target=task_execution_context.run, args=(tec,))
    p.start()
    p.join()
    if p.exitcode != 0:
        raise RuntimeError()


def process(id, callback_url):
    try:
        do_process(id)
        status = "success"
    except Exception as e:
        traceback.print_exc(file=sys.stdout)
        status = "failure"        

    if callback_url is not None:       
        r = requests.post(callback_url, data={"status": status, "id": id})

def get_element_quantity(element):
    """ Retrieve all quantities (Area, Volume, Thickness, Length, Width) from IfcElementQuantity. """
    quantities = {}
    for relDefinesByProperties in element.IsDefinedBy:
        if relDefinesByProperties.is_a('IfcRelDefinesByProperties'):
            property_set = relDefinesByProperties.RelatingPropertyDefinition
            if property_set.is_a('IfcElementQuantity'):
                for quantity in property_set.Quantities:
                    if quantity.is_a('IfcQuantityArea'):
                        quantities['Area'] = quantity.AreaValue
                    elif quantity.is_a('IfcQuantityVolume'):
                        quantities['Volume'] = quantity.VolumeValue
                    elif quantity.is_a('IfcQuantityLength'):
                        if quantity.Name == 'Length':
                            quantities['Length'] = quantity.LengthValue
                        elif quantity.Name == 'Width':
                            quantities['Width'] = quantity.LengthValue
    return quantities

def get_elements_from_glb(glb_path):
    # This function should use ifcopenshell or other relevant library to extract elements from the .glb file
    import ifcopenshell

    try:
        # Assuming ifcopenshell can be used similarly as for .ifc files
        elements = ifcopenshell.open(glb_path)
        elements_data = []
        for element in elements.by_type("IfcElement"):
            quantities = get_element_quantity(element)
            elements_data.append(
                {
                    'Family': element.is_a(),
                    'Type': element.ObjectType or '',
                    'Area': quantities.get('Area', ''),  # Empty string if 'Area' is not present
                    'Volume': quantities.get('Volume', ''),  # Empty string if 'Volume' is not present
                    'Length': quantities.get('Length', ''),  # Empty string if 'Thickness' is not present
                    'Thickness': quantities.get('Width', ''),  # Empty string if 'Thickness' is not present
                }
            )
    except Exception as e:
        print(f"Error extracting elements: {e}")
    return elements_data

