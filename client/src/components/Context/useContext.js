import React from 'react'
import Context from './ContextProvider'
const useContext = (props) => {
    const state={
        'name':'Harr',
        'class':'2'
    }
  return (
    <Context.Provider value={state}>
        {props.child}
    </Context.Provider>
    )
}

export default useContext
