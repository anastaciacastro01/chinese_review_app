import React, {Children} from 'react';
import ReactDOM from 'react-dom';
import classes from './styles/AppLayout.css';

export const AppLayout = ({children}) => {
  return (
    <div className="AppLayout">
      {Children.map(children, child => {
        return (
          <div>
            {child}
          </div>
          )
      })}
    </div>
  );
}

export const ActionArea = ({children}) => {
  return (
    <div className="ActionArea">
      {Children.map(children, child => {
        return (
          <div>
            {child}
          </div>
          )
      })}
    </div>
  );
}
