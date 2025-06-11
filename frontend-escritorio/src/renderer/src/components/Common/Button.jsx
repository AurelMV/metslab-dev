// src/components/Common/Button.jsx
import React from 'react'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = `btn-${size}`
  const fullWidthClass = fullWidth ? 'btn-full-width' : ''
  const disabledClass = disabled ? 'btn-disabled' : ''

  const classes = [baseClass, variantClass, sizeClass, fullWidthClass, disabledClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export default Button
