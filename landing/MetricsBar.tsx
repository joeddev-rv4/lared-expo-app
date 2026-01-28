'use client';

import { useState, useEffect } from 'react';

interface MetricProps {
  icon: string;
  value: string;
  label: string;
  color: string;
}

const Metric = ({
  icon,
  value,
  label,
  color,
}: MetricProps): React.ReactElement => {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (targetValue === 0) return;

    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 p-4 md:p-8">
      <div className={`text-4xl md:text-6xl mb-2`}>{icon}</div>
      <div
        className={`text-4xl md:text-6xl font-montserrat font-bold ${color}`}
      >
        {count > 0 ? count.toLocaleString() : value}
      </div>
      <div className="text-base md:text-xl font-lato font-bold text-aux-blue">
        {label}
      </div>
    </div>
  );
};

const MetricsBar = (): React.ReactElement => {
  return (
    <section className="bg-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-aux-blue mb-3 md:mb-4">
            Números que Hablan por Nosotros
          </h2>
          <p className="text-base md:text-xl font-lato text-aux-gray-blue px-4">
            Miles de brokers confían en La Red para hacer crecer su negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <Metric
            icon=""
            value="1247"
            label="Propiedades Listadas"
            color="text-brand-red"
          />
          <Metric
            icon=""
            value="523"
            label="Brokers Certificados"
            color="text-brand-red"
          />
          <Metric
            icon=""
            value="892"
            label="Transacciones Exitosas"
            color="text-brand-red"
          />
        </div>
      </div>
    </section>
  );
};

export default MetricsBar;
