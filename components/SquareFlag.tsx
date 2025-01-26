import ESFlag from "../assets/flags/es.svg";
import PLFlag from "../assets/flags/pl.svg";
import React, { FC } from "react";

const flagMap: Record<string, any> = {
  es: ESFlag,
  pl: PLFlag,
};

type SquareFlagProps = {
  languageCode: string;
  size?: number;
  style?: any;
}

const SquareFlag: FC<SquareFlagProps> = ({ languageCode, size, style }) => {
  const Flag = flagMap[languageCode];
  return Flag ? <Flag width={size ? size : 22} height={size ? size : 22} style={style}/> : null;
};

export default SquareFlag;