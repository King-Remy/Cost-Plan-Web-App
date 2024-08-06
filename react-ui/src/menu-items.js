const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/app/dashboard/default',
          icon: 'feather icon-home'
        },
        // {
        //   id: 'progress',
        //   title: 'Progress',
        //   type: 'item',
        //   url: '/progress/:id',
        //   icon: 'feather icon-loader'
        // },
        {
          id: 'viewer',
          title: 'Viewer',
          type: 'item',
          url: '/viewer',
          icon: 'feather icon-eye'
        },
        {
          id: 'estimate',
          title: 'Estimate',
          type: 'collapse',
          icon: 'feather icon-activity',
          children: [
            {
              id: 'estimate',
              title: 'Manage IFC',
              type: 'item',
              url: '/estimate',
              icon: 'feather icon-folder'
            },
            {
              id: 'estimate list',
              title: 'Estimates',
              type: 'item',
              icon: 'feather icon-server',
              url: '/estimate/list'
            },
            {
              id: 'templates',
              title: 'Templates',
              type: 'item',
              icon: 'feather icon-map',
              url: '/templates'
            },
          ]
        },
        {
          id: 'library',
          title: 'Library',
          type: 'item',
          url: '/library',
          icon: 'feather icon-book'
        },
      ]
    }
  ]
};

export default menuItems;
