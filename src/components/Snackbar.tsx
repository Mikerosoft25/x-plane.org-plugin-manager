import { FunctionComponent } from "react";
import crossIcon from '../assets/cross_icon.svg';

interface SnackbarProps {
  show: boolean,
  text: string,
  closeSnackbar: () => void,
}

export const Snackbar: FunctionComponent<SnackbarProps> = ({ show, text, closeSnackbar }) => {

  return (
    <div className={`snackbar ${show ? 'show' : ''}`}>
      <p className="text">
        {text}
      </p>
      <div
        className="cross"
        onClick={closeSnackbar}
      >
        <img src={crossIcon} />
      </div>
    </div>
  );
};