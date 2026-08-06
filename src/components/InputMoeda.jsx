import { NumericFormat } from 'react-number-format';

const InputMoeda = ({ label, value, onChange, name, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <NumericFormat
        name={name}
        value={value}
        inputMode="decimal"
        onValueChange={(values) => {
          onChange({ target: { name, value: values.floatValue } });
        }}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        {...props}
        className={`
          w-full px-3 py-2 border rounded-md outline-none transition-all
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
          bg-white text-gray-900
        `}
        placeholder="R$ 0,00"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default InputMoeda;
