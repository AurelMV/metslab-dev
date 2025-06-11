// src/components/Common/Input.jsx
import React from 'react'

const Input = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClass = 'input-group'
  const disabledClass = disabled ? 'input-disabled' : ''

  const classes = [baseClass, disabledClass, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {icon && <span className="input-icon">{icon}</span>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="input-field"
        {...props}
      />
    </div>
  )
}

export default Input
