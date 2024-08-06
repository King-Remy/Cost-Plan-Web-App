import React from 'react'

const TableColumnSort = ({ columns, sortByColumn}) => {

    const handleSort = (column) => {
        sortByColumn(column)
    }
  return (
    <div>
        <ul>
            {columns.map((column, index) => (
                <li key={index}>
                    <button onClick={() => handleSort(column)}>
                        {column}
                    </button>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default TableColumnSort