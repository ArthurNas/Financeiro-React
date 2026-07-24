import { useEffect, useState } from 'react';

const STORAGE_KEY = 'financeiro_valores_visiveis';

export function useValoresVisiveis() {
  const [valoresVisiveis, setValoresVisiveisState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const setValoresVisiveis = (value) => {
    setValoresVisiveisState((atual) => {
      const proximo = typeof value === 'function' ? value(atual) : value;
      localStorage.setItem(STORAGE_KEY, String(proximo));
      return proximo;
    });
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(valoresVisiveis));
  }, [valoresVisiveis]);

  return [valoresVisiveis, setValoresVisiveis];
}
