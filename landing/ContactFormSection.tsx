'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, User, Lock } from 'lucide-react';

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

    // Aquí puedes agregar la lógica para enviar el formulario
    console.log('Form data:', formData);

    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        '¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.'
      );
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
        className="absolute z-0 opacity-30"
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
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Título */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-white">
            Únete a La Red Inmobiliaria
          </h2>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 md:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Nombre completo */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
            </div>

            {/* Correo electrónico */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            {/* Número de teléfono */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2"
              >
                Número de teléfono
              </label>
              <div className="flex gap-2 md:gap-3">
                {/* Código de área */}
                <div className="relative w-28 md:w-32">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-aux-gray-blue" />
                  </div>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="block w-full pl-10 md:pl-12 pr-2 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base appearance-none bg-white"
                  >
                    {countryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Número */}
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{8,}"
                  className="block flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base"
                  placeholder="12345678"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="block w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm md:text-base font-lato font-semibold text-aux-dark-gray mb-2"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-aux-gray-blue" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="block w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-lato text-sm md:text-base"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            </div>

            {/* Checkbox de términos y condiciones */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-2 focus:ring-brand-blue cursor-pointer"
              />
              <label
                htmlFor="acceptTerms"
                className="text-xs md:text-sm font-lato text-aux-dark-gray leading-relaxed cursor-pointer"
              >
                Acepto los Términos y Condiciones y Política de Privacidad, y
                doy mi consentimiento para el tratamiento de mis datos
                personales
              </label>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 md:py-3 bg-gradient-to-r from-brand-red to-brand-red/90 text-white font-lato font-bold text-base md:text-lg rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : (
                'Completa tus datos'
              )}
            </button>

            {/* Enlace a inicio de sesión */}
            <p className="text-sm md:text-base font-lato text-aux-dark-gray text-center pt-2">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="text-brand-red font-semibold hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>

            {/* Texto legal */}
            <p className="text-xs md:text-sm font-lato text-aux-gray-blue text-center leading-relaxed pt-1">
              Al enviar este formulario, aceptas que nos comuniquemos contigo
              para brindarte información sobre nuestros servicios.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
