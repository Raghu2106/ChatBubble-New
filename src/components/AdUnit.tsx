import React from 'react';

export interface AdUnitProps {
  id?: string;
  format?: string;
  className?: string;
  adClient?: string;
  position?: string;
}

export const AdUnit: React.FC<AdUnitProps> = () => {
  return null;
};

export default AdUnit;
