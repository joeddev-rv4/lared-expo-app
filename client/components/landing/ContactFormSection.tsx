import React, { useState } from 'react';

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ContactFormSection = (): React.ReactElement => {
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+502',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryCodes = [
    { code: '+502', country: 'GT' },
    { code: '+503', country: 'SV' },
    { code: '+504', country: 'HN' },
    { code: '+505', country: 'NI' },
    { code: '+506', country: 'CR' },
    { code: '+507', country: 'PA' },
    { code: '+52', country: 'MX' },
    { code: '+1', country: 'US' },
  ];

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Form data:', formData);

    setTimeout(() => {
      setIsSubmitting(false);
      alert('Gracias por tu interes! Nos pondremos en contacto contigo pronto.');
      setFormData({
        fullName: '',
        countryCode: '+502',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontFamily: 'Lato, sans-serif',
    fontSize: '0.875rem',
  };

  return (
    <section
      id="formulario"
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden min-h-screen flex flex-col justify-center items-center"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
      }}
    >
      <div
        className="absolute z-0"
        style={{
          backgroundImage: 'url(/images/horizontal-lines-white.png)',
          backgroundSize: '120% 120%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
          opacity: 0.3,
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Title */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-white">
            Unete a La Red Inmobiliaria
          </h2>
        </div>

        {/* Form */}
        <div className="rounded-2xl shadow-2xl p-5 md:p-6 lg:p-8" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2">
                Correo electronico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            {/* Phone number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2">
                Numero de telefono
              </label>
              <div className="flex gap-2 md:gap-3">
                {/* Country code */}
                <div className="relative" style={{ width: '7rem' }}>
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-aux-gray-blue" />
                  </div>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      paddingRight: '0.5rem',
                    }}
                  >
                    {countryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number */}
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{8,}"
                  style={{
                    ...inputStyle,
                    paddingLeft: '0.75rem',
                    flex: 1,
                  }}
                  placeholder="12345678"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2">
                Contrasena
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  style={inputStyle}
                  placeholder="Minimo 8 caracteres"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2">
                Confirmar contrasena
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  style={inputStyle}
                  placeholder="Confirma tu contrasena"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                style={{ marginTop: '0.25rem', height: '1rem', width: '1rem', cursor: 'pointer' }}
              />
              <label htmlFor="acceptTerms" className="text-xs md:text-sm font-lato text-aux-dark-gray leading-relaxed cursor-pointer">
                Acepto los Terminos y Condiciones y Politica de Privacidad, y doy mi consentimiento para el tratamiento de mis datos personales
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 md:py-3 text-white font-lato font-bold text-base md:text-lg rounded-lg transition-all duration-200 shadow-lg mt-2"
              style={{
                background: 'linear-gradient(to right, #BF0A0A, rgba(191, 10, 10, 0.9))',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Enviando...
                </span>
              ) : (
                'Completa tus datos'
              )}
            </button>

            {/* Login link */}
            <p className="text-sm md:text-base font-lato text-aux-dark-gray text-center pt-2">
              Ya tienes una cuenta?{' '}
              <a href="/login" className="text-brand-red font-semibold hover:underline" style={{ textDecoration: 'none' }}>
                Iniciar sesion
              </a>
            </p>

            {/* Legal text */}
            <p className="text-xs md:text-sm font-lato text-aux-gray-blue text-center leading-relaxed pt-1">
              Al enviar este formulario, aceptas que nos comuniquemos contigo para brindarte informacion sobre nuestros servicios.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
