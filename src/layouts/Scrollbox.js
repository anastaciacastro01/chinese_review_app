import React, {Children} from 'react';
import ReactDOM from 'react-dom';
import classes from './styles/Scrollbox.css';

export const Scrollbox = ({rowType, content, children}) => {
  return (
    <div className="Scrollbox">
      {
        content().map(item => {
          if(item === "add definition") {
            return (
              <div className="row">
                <label htmlFor={item}>
                <input 
                  id={item} 
                  className="defOption" 
                  type={rowType} 
                  name={item} 
                  onChange={() => {
                    let other = document.getElementById("otherOption");
                    other.disabled = !other.disabled;
                    other.value = "";
                }}/>
               {item}
                <input 
                  type="text" 
                  id="otherOption" 
                  name={item} 
                  autocomplete="off"
                  disabled 
                />
                </label>
              </div>
            );
          }
          return (
            <div className="row">
              <label htmlFor={item}>
              <input 
                id={item} 
                className="defOption" 
                type={rowType} 
                name={item} 
              />
              {item}
              </label>
            </div>
          );
        })
      }
    </div>
  );
}
