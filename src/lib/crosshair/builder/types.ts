export type CrosshairSection = {
  color: number;
  useCustomColor: boolean;
  hexColor: { enabled: boolean; value: string };
  outlines: { enabled: boolean; width: number; alpha: number };
  dot: { enabled: boolean; width: number; alpha: number };
  overwriteFireMul: boolean;
  inner: {
    enabled: boolean;
    width: number;
    length: number;
    vertical: { enabled: boolean; length: number };
    offset: number;
    alpha: number;
    moveMul: { enabled: boolean; mul: number };
    fireMul: { enabled: boolean; mul: number };
  };
  outer: {
    enabled: boolean;
    width: number;
    length: number;
    vertical: { enabled: boolean; length: number };
    offset: number;
    alpha: number;
    moveMul: { enabled: boolean; mul: number };
    fireMul: { enabled: boolean; mul: number };
  };
};

export type Parsed = {
  general: {
    advancedOptions: boolean;
    adsUsePrimary: boolean;
    overwriteAllPrimary: boolean;
    hideOnFire: boolean;
    followSpectating: boolean;
  };
  primary: CrosshairSection;
  ads: CrosshairSection;
  sniper: {
    color: number;
    useCustomColor: boolean;
    hexColor: { enabled: boolean; value: string };
    dot: { enabled: boolean; width: number; alpha: number };
  };
};

export type Mode = "primary" | "ads" | "sniper";

export type MapEntry = [
  string,
  number,
  number,
  boolean,
  ((v: number) => unknown)?
];
