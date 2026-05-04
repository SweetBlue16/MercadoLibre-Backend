'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('producto', [
      {
        id: 1,
        titulo: 'Televisor Inteligente LG 65" 4K UHD',
        descripcion:
          'El Televisor OLED Smart TV 65 4K UHD de LG (Modelo/Clase 2023) es un producto de última tecnología que te permitirá disfrutar de una experiencia visual inigualable. Este modelo cuenta con una pantalla OLED de 65 pulgadas con resolución de UHD, lo que te permitirá ver tus contenidos favoritos con una calidad de imagen excepcional.',
        precio: 10900,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        titulo: 'Apple iPhone 14 Pro 256 GB',
        descripcion:
          'Apple iPhone 14 Pro 256 GB, negro espacial. Pantalla OLED, 6.1 pulgadas, cámara triple, iOS 16. Conectividad 5G, chip A16 Bionic. Cámara avanzada con 48 MP. Ideal para capturar los mejores momentos de tu vida con gran rapidez.',
        precio: 29500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        titulo: 'Laptop MacBook Air 13" (M2, 2022)',
        descripcion:
          'Laptop MacBook Air 13" (2022), chip M2, 8 GB de RAM, 256 GB de SSD, color oro, con macOS original. Características de seguridad y ligereza ideal para el trabajo y el día a día.',
        precio: 26500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        titulo: 'Bicicleta Urbana LUXEVO Vento Rodada 28"',
        descripcion:
          'Bicicleta urbana Luxevo Vento rodada 28, 21 velocidades. Ideal para trayectos en ciudad y caminos mixtos. Diseño ergonómico y sistema de cambios Shimano.',
        precio: 3700,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        titulo: 'Monitor Gamer Curvo de 15.6" | 1ms y 240 Hz (Color Negro)',
        descripcion:
          'Monitor gamer de 15.6 pulgadas con resolución de 1080p y frecuencia de actualización de 240Hz. Para usuarios que buscan lo mejor en rendimiento visual.',
        precio: 4500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        titulo: 'Silla de Escritorio Ergonómica Ejecutiva Pro',
        descripcion:
          'Silla ergonómica ejecutiva con soporte lumbar y diseño moderno. Ideal para uso en oficina o home office. Respaldo reclinable y altura ajustable.',
        precio: 3200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        titulo: 'Escritorio Moderno para Estudio (Color Blanco)',
        descripcion:
          'Escritorio moderno blanco de tamaño compacto. Superficie amplia, ideal para estudiantes o trabajadores remotos.',
        precio: 1899,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        titulo: 'Lámpara LED Recargable de Escritorio Portátil',
        descripcion:
          'Lámpara de escritorio LED recargable con brazo ajustable. Batería de larga duración. Incluye sensor de toque para control de intensidad de luz.',
        precio: 780,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        titulo: 'Auriculares Gamer Inalámbricos con Micrófono',
        descripcion:
          'Auriculares gamer con micrófono integrado. Tecnología inalámbrica de baja latencia. Compatibles con PC, consolas y móviles.',
        precio: 2100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        titulo: 'Silla Tipo Puff Redonda',
        descripcion:
          'Silla tipo puff redonda de vinipiel. Diseño moderno y cómodo. Perfecta para espacios juveniles o relajación en casa.',
        precio: 950,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        titulo: 'Escritorio de Pared con Estante y Ganchos (Color Natural)',
        descripcion:
          'Escritorio plegable de pared con estante y ganchos. Ahorra espacio y es funcional. Ideal para departamentos pequeños.',
        precio: 1480,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 12,
        titulo: 'Licuadora Ninja Pro 1000 W (Modelo 2023)',
        descripcion:
          'Licuadora profesional Ninja con motor de 1000 watts. Cuchillas de acero inoxidable y vaso de gran capacidad. Ideal para smoothies y sopas.',
        precio: 2100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 13,
        titulo: 'Refrigerador Samsung RT29K5710S8/EM',
        descripcion:
          'Refrigerador Samsung con tecnología Twin Cooling Plus. Capacidad de 300 litros. Bajo consumo energético y diseño elegante en acero inoxidable.',
        precio: 8950,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 14,
        titulo:
          'Laptop HP 15s-fq5022la (12va generación Intel i5, 512 GB SSD, 8 GB RAM)',
        descripcion:
          'Laptop HP con procesador Intel i5 de 12va generación, 512 GB SSD, 8 GB RAM. Ideal para trabajo remoto, uso estudiantil y entretenimiento.',
        precio: 13499,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 15,
        titulo: 'Smartphone Redmi Note 11 Pro+ 5G - Negro Espacial',
        descripcion:
          'Redmi Note 11 Pro+ 5G, con 128 GB de almacenamiento interno, 6 GB de RAM. Cámara cuádruple con sensor principal de 108 MP.',
        precio: 7399,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 16,
        titulo: 'Cafetera Espresso Oster PrimaLatte Touch',
        descripcion:
          'Cafetera espresso automática Oster con sistema de leche espumada. Ideal para preparar cappuccinos, lattes y espresso con un solo toque.',
        precio: 3599,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 17,
        titulo: 'Cafetera Chemex de 6 tazas - vidrio templado',
        descripcion:
          'Cafetera Chemex de 6 tazas hecha de vidrio templado. Método de goteo artesanal. Ideal para los amantes del café filtrado.',
        precio: 850,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 18,
        titulo: 'Café Orgánico de Oaxaca - 1 kg',
        descripcion:
          'Café orgánico en grano, cultivado en las montañas de Oaxaca. De sabor suave, con notas cítricas y aroma profundo.',
        precio: 320,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 19,
        titulo: 'Grano de Café Colombiano Supremo - 1 kg',
        descripcion:
          'Grano de café colombiano premium, tostado medio. Aroma intenso, cuerpo balanceado y sabor persistente. Ideal para métodos de filtrado o espresso.',
        precio: 315,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 20,
        titulo: 'Café Soluble Suave Taster’s Choice Café Colombiano 190g',
        descripcion:
          'Taster’s Choice Café Colombiano ofrece una experiencia sensorial única, proporcionando un balance perfecto en cada taza. Elaborado con altos estándares de calidad y una mezcla de granos únicos, que resalta las notas más puras del café al evitar el uso de altas temperaturas.',
        precio: 232.49,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('producto', null, {});
  },
};
