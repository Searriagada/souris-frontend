import Select, { StylesConfig } from 'react-select';

interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  name?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
}

export const CustomSelect = ({
  label,
  error,
  options,
  placeholder = 'Selecciona una opción...',
  value,
  onChange,
  name,
  isSearchable = true,
  isClearable = true,
}: CustomSelectProps) => {
  // Encontrar la opción seleccionada
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Estilos personalizados con el tema Industrial Elegant
  const customStyles: StylesConfig<SelectOption> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#18181b',
      borderColor: state.isFocused ? '#b45309' : '#27272a',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      //padding: '0.375rem 0', //Daba error de altura
      minHeight: 'unset',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: state.isFocused ? '#b45309' : '#3f3f46',
      },
      boxShadow: state.isFocused ? '0 0 0 3px rgba(180, 83, 9, 0.1)' : 'none',
    }),
    input: (base) => ({
      ...base,
      color: '#ffffff',
      fontSize: '1rem',
      padding: '0.5rem',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#71717a',
      fontSize: '1rem',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#ffffff',
      fontSize: '1rem',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '0.5rem',
      marginTop: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.5rem 0',
      maxHeight: '240px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'rgba(180, 83, 9, 0.3)'
        : state.isFocused
          ? '#27272a'
          : 'transparent',
      color: state.isSelected ? '#fbbf24' : '#e4e4e7',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'colors 0.15s',
      '&:active': {
        backgroundColor: 'rgba(180, 83, 9, 0.3)',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#a1a1aa',
      '&:hover': {
        color: '#e4e4e7',
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#71717a',
      transition: 'transform 0.2s',
      '&:hover': {
        color: '#b45309',
      },
    }),
  };

  const handleChange = (newValue: any) => {
    if (newValue && typeof newValue === 'object' && 'value' in newValue) {
      onChange(newValue.value);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      <Select<SelectOption>
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={() => 'Sin resultados'}
      />

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <span className="w-1 h-1 bg-red-400 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;