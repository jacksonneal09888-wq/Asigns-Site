/*
  Site-wide EN/ES language toggle.
  Static content is translated via data-i18n / data-i18n-placeholder / data-i18n-aria-label
  attributes. Dynamic JS strings (shop.js, script.js, asigns-chat.js) call window.t(key).
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'asignsLang';

  const DICT = {
    // Nav
    'nav.home': { en: 'Home', es: 'Inicio' },
    'nav.services': { en: 'Services', es: 'Servicios' },
    'nav.pricing': { en: 'Pricing', es: 'Precios' },
    'nav.shop': { en: 'Shop', es: 'Tienda' },
    'nav.gangBuilder': { en: 'Gang Sheet Builder', es: 'Creador de Gang Sheets' },
    'nav.gangBuilderShort': { en: 'Gang Sheets', es: 'Gang Sheets' },
    'nav.teeDesigner': { en: 'Tee Designer', es: 'Diseñador de Playeras' },
    'nav.websites': { en: 'Websites', es: 'Sitios Web' },
    'nav.gallery': { en: 'Gallery', es: 'Galería' },
    'nav.faq': { en: 'FAQ', es: 'Preguntas' },
    'nav.contact': { en: 'Contact', es: 'Contacto' },
    'nav.langToggle': { en: 'Español', es: 'English' },

    // Hero
    'hero.eyebrow': { en: 'SIGNS • PRINTING • APPAREL', es: 'LETREROS • IMPRESIÓN • ROPA' },
    'hero.h1': { en: 'Signs, Wraps & Apparel Made Local', es: 'Letreros, Rótulos y Ropa Hechos Localmente' },
    'hero.p': { en: "From storefront signs to vehicle wraps to rush-order tees — designed, printed, and installed right here in Siler City, NC.", es: 'Desde letreros para negocios hasta rotulación de vehículos y playeras urgentes — diseñado, impreso e instalado aquí mismo en Siler City, NC.' },
    'hero.ctaStart': { en: 'Start a Project', es: 'Iniciar un Proyecto' },
    'hero.ctaServices': { en: 'View Services', es: 'Ver Servicios' },
    'hero.trustHours': { en: 'Mon–Fri 9am–5pm', es: 'Lun–Vie 9am–5pm' },

    // Path section
    'path.h2': { en: 'What are you here for?', es: '¿Qué estás buscando?' },
    'path.p': { en: 'Jump straight to the tools and info for your project.', es: 'Ve directo a las herramientas e información para tu proyecto.' },
    'path.signage.h3': { en: 'Signs & Vehicle Graphics', es: 'Letreros y Rotulación Vehicular' },
    'path.signage.p': { en: 'Storefront signs, banners, wraps, magnets, and window graphics.', es: 'Letreros para negocios, banners, rotulación, imanes y gráficos de ventana.' },
    'path.signage.cta': { en: 'Get a signage quote →', es: 'Cotiza tu letrero →' },
    'path.apparel.h3': { en: 'Apparel & DTF Printing', es: 'Ropa e Impresión DTF' },
    'path.apparel.p': { en: 'Gang sheets, custom tees, and rush apparel runs.', es: 'Gang sheets, playeras personalizadas y pedidos urgentes.' },
    'path.apparel.cta': { en: 'Start designing →', es: 'Empieza a diseñar →' },
    'path.web.h3': { en: 'Websites & Digital', es: 'Sitios Web y Digital' },
    'path.web.p': { en: 'Custom site builds and ongoing digital support.', es: 'Sitios web personalizados y soporte digital continuo.' },
    'path.web.cta': { en: 'See our work →', es: 'Ve nuestro trabajo →' },

    // Specialize section
    'specialize.h2': { en: 'We Specialize In:', es: 'Nos Especializamos En:' },
    'specialize.p': { en: 'Full-service signs, printing, and installs built for fast-moving local brands.', es: 'Letreros, impresión e instalación de servicio completo para marcas locales que se mueven rápido.' },
    'specialize.item1': { en: 'Business Signs', es: 'Letreros para Negocios' },
    'specialize.item2': { en: 'Banners & Posters', es: 'Banners y Pósters' },
    'specialize.item3': { en: 'Vehicle Magnets', es: 'Imanes para Vehículos' },
    'specialize.item4': { en: 'Window Graphics', es: 'Gráficos de Ventana' },
    'specialize.item5': { en: 'Yard Signs', es: 'Letreros de Jardín' },
    'specialize.item6': { en: 'Custom Vinyl Lettering', es: 'Letras de Vinil Personalizadas' },
    'specialize.item7': { en: 'LED & Lighted Signs', es: 'Letreros LED e Iluminados' },
    'specialize.calloutTag': { en: 'Rush Apparel', es: 'Ropa Urgente' },
    'specialize.calloutH3': { en: 'Custom T-Shirts in 24 Hours', es: 'Playeras Personalizadas en 24 Horas' },
    'specialize.calloutP': { en: "Need shirts fast? We design, print, and prep in-house so you can launch without delays.", es: '¿Necesitas playeras rápido? Diseñamos, imprimimos y preparamos todo internamente para que no haya demoras.' },
    'specialize.calloutBtn': { en: 'Get a rush quote', es: 'Cotización urgente' },
    'specialize.calloutNote': { en: 'Local pickup and delivery available.', es: 'Recogida y entrega local disponible.' },

    // Stats
    'stats.signs': { en: 'Signs Installed', es: 'Letreros Instalados' },
    'stats.hours': { en: 'Hour T-Shirt Turnaround', es: 'Horas de Entrega de Playeras' },
    'stats.reviews': { en: 'Star Local Reviews', es: 'Estrellas en Reseñas Locales' },

    // Services section
    'services.h2': { en: 'Custom Signs, Wraps, and Apparel in One Place', es: 'Letreros, Rotulación y Ropa Personalizada en un Solo Lugar' },
    'services.p': { en: 'From storefront signs to full vehicle wraps and rush-order shirts, we design, print, and install everything under one roof in Siler City, NC.', es: 'Desde letreros para negocios hasta rotulación completa de vehículos y playeras urgentes, diseñamos, imprimimos e instalamos todo bajo un mismo techo en Siler City, NC.' },
    'services.learnMore': { en: 'Learn more', es: 'Saber más' },
    'services.signage.h3': { en: 'Custom Signage', es: 'Letreros Personalizados' },
    'services.signage.p': { en: "From concept to installation, we create bespoke signs that capture your brand's essence and attract attention.", es: 'Desde el concepto hasta la instalación, creamos letreros a la medida que capturan la esencia de tu marca y atraen atención.' },
    'services.wraps.h3': { en: 'Vehicle Wraps', es: 'Rotulación de Vehículos' },
    'services.wraps.p': { en: 'Transform your fleet into mobile billboards with high-quality, durable vehicle wraps that make a lasting impression.', es: 'Convierte tu flotilla en anuncios móviles con rotulación duradera y de alta calidad que deja una impresión duradera.' },
    'services.banners.h3': { en: 'Banners & Flags', es: 'Banners y Banderas' },
    'services.banners.p': { en: 'Promote your events and sales with vibrant banners and flags designed for maximum visibility and impact.', es: 'Promociona tus eventos y ventas con banners y banderas vibrantes diseñados para máxima visibilidad e impacto.' },
    'services.digital.h3': { en: 'Digital Printing', es: 'Impresión Digital' },
    'services.digital.p': { en: 'High-resolution digital printing for all your marketing materials, ensuring crisp images and vivid colors.', es: 'Impresión digital de alta resolución para todo tu material de marketing, con imágenes nítidas y colores vivos.' },
    'services.design.h3': { en: 'Graphic Design', es: 'Diseño Gráfico' },
    'services.design.p': { en: 'Our expert designers work with you to create stunning visuals that communicate your message effectively.', es: 'Nuestros diseñadores expertos trabajan contigo para crear visuales impresionantes que comunican tu mensaje eficazmente.' },
    'services.install.h3': { en: 'Installation & Maintenance', es: 'Instalación y Mantenimiento' },
    'services.install.p': { en: 'Professional installation and ongoing maintenance services to ensure your signage always looks its best.', es: 'Instalación profesional y mantenimiento continuo para que tu letrero siempre se vea impecable.' },
    'services.web.h3': { en: 'Website Design & Creation', es: 'Diseño y Creación de Sitios Web' },
    'services.web.p': { en: "Crafting stunning and functional websites tailored to your brand's needs, from concept to launch.", es: 'Creamos sitios web funcionales e impresionantes hechos a la medida de tu marca, desde el concepto hasta el lanzamiento.' },
    'services.tee.h3': { en: 'T-Shirt Design', es: 'Diseño de Playeras' },
    'services.tee.p': { en: 'Custom t-shirt designs that make a statement and promote your brand with style.', es: 'Diseños de playeras personalizados que destacan y promueven tu marca con estilo.' },
    'services.dtf.h3': { en: 'DTF Prints', es: 'Impresiones DTF' },
    'services.dtf.p': { en: 'High-quality Direct-to-Film (DTF) prints for vibrant and durable custom apparel.', es: 'Impresiones DTF (Direct-to-Film) de alta calidad para ropa personalizada vibrante y duradera.' },

    // CTA banner dark
    'ctaDark.h3': { en: 'Need art tweaks, color matching, or fulfillment?', es: '¿Necesitas ajustes de arte, igualación de color o cumplimiento de pedidos?' },
    'ctaDark.p': { en: 'Our in-house designers and logistics team can prep files, match Pantones, and drop-ship to your customers.', es: 'Nuestro equipo interno de diseño y logística puede preparar archivos, igualar Pantones y enviar directo a tus clientes.' },
    'ctaDark.btn': { en: 'Talk with a specialist', es: 'Habla con un especialista' },

    // Pricing
    'pricing.h2': { en: 'DTF Gang Sheet Price List', es: 'Lista de Precios de Gang Sheets DTF' },
    'pricing.p': { en: 'High-quality colors, 24-hour turnaround, and no minimums on our most popular sheet sizes.', es: 'Colores de alta calidad, entrega en 24 horas y sin mínimos en nuestros tamaños más populares.' },
    'pricing.dimension': { en: 'Sheet size', es: 'Tamaño de hoja' },
    'pricing.badge': { en: 'Most Popular', es: 'Más Popular' },
    'pricing.sub1': { en: 'Perfect for fast turns', es: 'Perfecto para pedidos rápidos' },
    'pricing.sub2': { en: 'Balanced size for brands', es: 'Tamaño equilibrado para marcas' },
    'pricing.sub3': { en: 'More space for bulk runs', es: 'Más espacio para pedidos grandes' },
    'pricing.sub4': { en: 'Max layout for big drops', es: 'Diseño máximo para lanzamientos grandes' },
    'pricing.btnBuild': { en: 'Build this sheet', es: 'Crear esta hoja' },
    'pricing.btnStart': { en: 'Start designing', es: 'Empezar a diseñar' },
    'pricing.note': { en: 'Overlapped or stacked designs may be subject to higher pricing. Need a custom sheet size?', es: 'Los diseños superpuestos pueden tener un costo adicional. ¿Necesitas un tamaño personalizado?' },
    'pricing.noteLink': { en: 'Contact us', es: 'Contáctanos' },
    'pricing.noteEnd': { en: 'for a tailored quote.', es: 'para una cotización a la medida.' },

    // Signage quote
    'signage.h2': { en: 'Get a Signage Quote', es: 'Cotiza tu Letrero' },
    'signage.p': { en: "Signage is priced per project — tell us the basics and we'll follow up with firm pricing and a timeline, usually same day.", es: 'Los letreros se cotizan por proyecto — cuéntanos lo básico y te contactaremos con el precio final y tiempo de entrega, normalmente el mismo día.' },
    'signage.type': { en: 'What do you need?', es: '¿Qué necesitas?' },
    'signage.size': { en: 'Approximate size', es: 'Tamaño aproximado' },
    'signage.quantity': { en: 'Quantity', es: 'Cantidad' },
    'signage.install': { en: 'Installation needed?', es: '¿Necesitas instalación?' },
    'signage.name': { en: 'Full name', es: 'Nombre completo' },
    'signage.email': { en: 'Email', es: 'Correo electrónico' },
    'signage.phone': { en: 'Phone (optional)', es: 'Teléfono (opcional)' },
    'signage.notes': { en: 'Tell us more', es: 'Cuéntanos más' },
    'signage.notesPlaceholder': { en: 'Location, materials, deadline, artwork status...', es: 'Ubicación, materiales, fecha límite, estado del diseño...' },
    'signage.submit': { en: 'Send Signage Quote Request', es: 'Enviar Solicitud de Cotización' },
    'signage.typeBusiness': { en: 'Business sign', es: 'Letrero de negocio' },
    'signage.typeBanner': { en: 'Banner / flag', es: 'Banner / bandera' },
    'signage.typeYard': { en: 'Yard sign', es: 'Letrero de jardín' },
    'signage.typeWindow': { en: 'Window graphics', es: 'Gráficos de ventana' },
    'signage.typeVinyl': { en: 'Vinyl lettering', es: 'Letras de vinil' },
    'signage.typeLed': { en: 'LED / lighted sign', es: 'Letrero LED / iluminado' },
    'signage.typeVehicle': { en: 'Vehicle wrap or magnet', es: 'Rotulación o imán vehicular' },
    'signage.typeOther': { en: 'Something else', es: 'Algo más' },
    'signage.yes': { en: 'Yes', es: 'Sí' },
    'signage.no': { en: 'No', es: 'No' },
    'signage.notSure': { en: 'Not sure', es: 'No estoy seguro' },

    // Feature showcase
    'features.h2': { en: 'Why Choose Us?', es: '¿Por Qué Elegirnos?' },
    'features.p': { en: 'Fast, local, and built to make your brand look sharp in every setting.', es: 'Rápido, local y hecho para que tu marca luzca impecable en cualquier lugar.' },
    'features.fast.h3': { en: 'Fast Turnaround', es: 'Entrega Rápida' },
    'features.fast.p': { en: 'Rush-friendly production keeps your launches and installs on schedule.', es: 'Producción con opción urgente para que tus lanzamientos e instalaciones estén a tiempo.' },
    'features.quality.h3': { en: 'High-Quality Materials', es: 'Materiales de Alta Calidad' },
    'features.quality.p': { en: 'Durable substrates, crisp color, and clean finishing built for long-term use.', es: 'Materiales duraderos, colores nítidos y acabados limpios hechos para durar.' },
    'features.custom.h3': { en: 'Custom Designs', es: 'Diseños Personalizados' },
    'features.custom.p': { en: 'We design to your brand standards and offer proofs before production.', es: 'Diseñamos según los estándares de tu marca y ofrecemos pruebas antes de producir.' },
    'features.local.h3': { en: 'Local Install & Support', es: 'Instalación y Soporte Local' },
    'features.local.p': { en: 'On-site installs, fast fixes, and a team you can reach anytime.', es: 'Instalaciones en sitio, reparaciones rápidas y un equipo siempre disponible.' },

    // CTA banner light
    'ctaLight.h3': { en: 'Need interactive tools?', es: '¿Necesitas herramientas interactivas?' },
    'ctaLight.p': { en: 'Use our digital Gang Sheet Builder and Tee Designer to prep files before handing them off to our production team.', es: 'Usa nuestro Creador de Gang Sheets y Diseñador de Playeras digital para preparar tus archivos antes de enviarlos a producción.' },
    'ctaLight.btn1': { en: 'Open Gang Sheet Builder', es: 'Abrir Creador de Gang Sheets' },
    'ctaLight.btn2': { en: 'Open Tee Designer', es: 'Abrir Diseñador de Playeras' },

    // Websites section
    'websites.h2': { en: 'Custom Websites That Convert', es: 'Sitios Web Personalizados Que Convierten' },
    'websites.p': { en: 'Beyond print, our team designs, builds, and deploys digital storefronts that look great and drive sales.', es: 'Más allá de la impresión, nuestro equipo diseña, construye y lanza tiendas digitales que se ven bien y generan ventas.' },
    'websites.label': { en: 'Recent Launch', es: 'Lanzamiento Reciente' },
    'websites.desc': { en: 'Clean typography, lightning-fast load times, and a tailored ecommerce experience for a leading martial arts academy. Built on a modular CMS so the client can update classes, apparel, and events in minutes.', es: 'Tipografía limpia, tiempos de carga ultrarrápidos y una experiencia de comercio electrónico a la medida para una academia de artes marciales líder. Construido sobre un CMS modular para que el cliente actualice clases, ropa y eventos en minutos.' },
    'websites.li1': { en: 'Mobile-first responsive layout', es: 'Diseño responsivo enfocado en móvil' },
    'websites.li2': { en: 'Integrated merch and membership flows', es: 'Flujos integrados de mercancía y membresías' },
    'websites.li3': { en: 'Custom photography and brand palette', es: 'Fotografía personalizada y paleta de marca' },
    'websites.visit': { en: 'Visit Site', es: 'Visitar Sitio' },
    'websites.start': { en: 'Start a Web Project', es: 'Iniciar un Proyecto Web' },
    'websites.h3-2': { en: 'Bring Your Next Site to Life', es: 'Dale Vida a Tu Próximo Sitio' },
    'websites.desc2': { en: 'Need a Shopify build, booking platform, or marketing site? Our design and dev team can handle UX, copy, and launch strategy alongside your print collateral.', es: '¿Necesitas una tienda en Shopify, plataforma de reservas o sitio de marketing? Nuestro equipo de diseño y desarrollo maneja UX, contenido y estrategia de lanzamiento junto con tu material impreso.' },
    'websites.li4': { en: 'Shopify & WooCommerce storefronts', es: 'Tiendas en Shopify y WooCommerce' },
    'websites.li5': { en: 'Landing pages with conversion tracking', es: 'Páginas de aterrizaje con seguimiento de conversión' },
    'websites.li6': { en: 'Content updates & ongoing support', es: 'Actualizaciones de contenido y soporte continuo' },
    'websites.book': { en: 'Book a discovery call', es: 'Agenda una llamada' },

    // Gallery
    'gallery.h2': { en: 'Fresh Off Our Press', es: 'Recién Salido de Impresión' },
    'gallery.p': { en: 'A curated look at recent signs, vehicle wraps, window graphics, and apparel for local businesses.', es: 'Una muestra de nuestros letreros, rotulación vehicular, gráficos de ventana y ropa recientes para negocios locales.' },
    'gallery.tag.vehicle': { en: 'Vehicle wrap', es: 'Rotulación vehicular' },
    'gallery.item1.h3': { en: 'HighQuality & Remodeling', es: 'HighQuality & Remodeling' },
    'gallery.item1.p': { en: 'Full truck wrap with photo-real deck and interior panels — a mobile billboard for a local remodeling contractor.', es: 'Rotulación completa de camioneta con paneles fotorrealistas — un anuncio móvil para un contratista de remodelación local.' },
    'gallery.tag.sign': { en: 'Business sign', es: 'Letrero de negocio' },
    'gallery.item2.h3': { en: 'Little Angels Learning Center', es: 'Little Angels Learning Center' },
    'gallery.item2.p': { en: 'Weatherproof post-mounted sign for a Snow Camp, NC childcare center — built to hold up outdoors year-round.', es: 'Letrero resistente al clima montado en poste para una guardería en Snow Camp, NC — hecho para durar todo el año a la intemperie.' },
    'gallery.tag.window': { en: 'Window graphics', es: 'Gráficos de ventana' },
    'gallery.item3.h3': { en: 'La Jarocha Restaurant', es: 'Restaurante La Jarocha' },
    'gallery.item3.p': { en: 'Full storefront window graphics turning blank glass into a menu-driven, eye-catching facade.', es: 'Gráficos completos en ventanas que convierten vidrio en blanco en una fachada llamativa con el menú.' },
    'gallery.tag.trailer': { en: 'Trailer wrap', es: 'Rotulación de trailer' },
    'gallery.item4.h3': { en: 'Quesabirrias Tia Clau', es: 'Quesabirrias Tía Clau' },
    'gallery.item4.p': { en: 'Full-coverage food trailer wrap with mouth-watering menu photography that sells before customers even order.', es: 'Rotulación completa de food trailer con fotografía del menú que vende antes de que el cliente ordene.' },
    'gallery.tag.van': { en: 'Van lettering', es: 'Rotulación de camioneta' },
    'gallery.item5.h3': { en: 'United Autoglass 837', es: 'United Autoglass 837' },
    'gallery.item5.p': { en: 'Cut-vinyl lettering and decals turning a service van into a rolling ad for a local auto glass company.', es: 'Letras y calcomanías de vinil que convierten una camioneta de servicio en un anuncio rodante para una compañía local de cristales.' },
    'gallery.tag.boxtruck': { en: 'Box truck wrap', es: 'Rotulación de camión' },
    'gallery.item6.h3': { en: 'Cristo Viene Pronto', es: 'Cristo Viene Pronto' },
    'gallery.item6.p': { en: 'Full box truck wrap with custom scripture artwork for a local ministry — built to turn heads at highway speed.', es: 'Rotulación completa de camión con arte bíblico personalizado para un ministerio local — hecho para llamar la atención en carretera.' },
    'gallery.tag.vanwrap': { en: 'Van wrap', es: 'Rotulación de camioneta' },
    'gallery.item7.h3': { en: 'CCM Heat & Air', es: 'CCM Heat & Air' },
    'gallery.item7.p': { en: 'Clean, professional van wrap for an HVAC company — logo, licensing badges, and contact info all in one clear layout.', es: 'Rotulación limpia y profesional para una compañía de HVAC — logo, certificaciones e información de contacto en un diseño claro.' },
    'gallery.tag.apparel': { en: 'Custom apparel', es: 'Ropa personalizada' },
    'gallery.item8.h3': { en: 'Taquiza Lupita', es: 'Taquiza Lupita' },
    'gallery.item8.p': { en: 'Front-and-back custom tee design for a local catering service — chest logo up front, full contact card on the back.', es: 'Diseño de playera personalizado al frente y atrás para un servicio de banquetes local — logo al frente y tarjeta de contacto completa atrás.' },

    // Testimonials
    'testimonials.h2': { en: 'Trusted by Merch Makers & Marketers', es: 'Confiado por Creadores de Mercancía y Marketing' },
    'testimonials.q1': { en: '"Asigns handled our festival launch with zero hiccups—gang sheets were perfect and on our doorstep the next morning."', es: '"Asigns manejó el lanzamiento de nuestro festival sin ningún problema—los gang sheets quedaron perfectos y llegaron a la puerta la mañana siguiente."' },
    'testimonials.a1': { en: '- Maya R., Event Merch Director', es: '- Maya R., Directora de Mercancía de Eventos' },
    'testimonials.q2': { en: '"Color accuracy has always been a challenge for us. Their team nailed our gradients and even matched specialty Pantones."', es: '"La precisión del color siempre ha sido un reto para nosotros. Su equipo logró nuestros degradados perfectamente y hasta igualaron Pantones especiales."' },
    'testimonials.a2': { en: '- Colin T., Streetwear Founder', es: '- Colin T., Fundador de Marca Streetwear' },
    'testimonials.q3': { en: '"The builder made layout effortless. We duplicated SKUs fast, downloaded the proof, and the final sheets pressed beautifully."', es: '"El creador hizo el diseño muy fácil. Duplicamos SKUs rápido, descargamos la prueba y las hojas finales prensaron perfectamente."' },
    'testimonials.a3': { en: '- Briana W., Print Shop Owner', es: '- Briana W., Dueña de Taller de Impresión' },

    // FAQ
    'faq.h2': { en: 'Frequently Asked Questions', es: 'Preguntas Frecuentes' },
    'faq.q1': { en: 'What file types work best?', es: '¿Qué tipos de archivo funcionan mejor?' },
    'faq.a1': { en: 'We recommend transparent PNG, TIFF, or vector PDF files at 300 DPI. If you only have JPEG or need cleanup, upload what you have and we’ll help prep it.', es: 'Recomendamos archivos PNG transparente, TIFF o PDF vectorial a 300 DPI. Si solo tienes JPEG o necesitas ayuda, envíanos lo que tengas y te ayudamos a prepararlo.' },
    'faq.q2': { en: 'How fast can you ship?', es: '¿Qué tan rápido pueden enviar?' },
    'faq.a2': { en: 'Orders approved before noon typically ship the same day. Local pickup is available, and we can arrange overnight or blind drop shipping nationwide.', es: 'Los pedidos aprobados antes del mediodía normalmente se envían el mismo día. Hay recogida local disponible, y podemos organizar envío urgente o directo a nivel nacional.' },
    'faq.q3': { en: 'Do you have minimums?', es: '¿Tienen mínimos de pedido?' },
    'faq.a3': { en: 'No minimums on gang sheets or single transfers. We offer tiered discounts once you hit 10+ sheets or recurring weekly runs.', es: 'Sin mínimos en gang sheets o transferencias individuales. Ofrecemos descuentos por volumen a partir de 10+ hojas o pedidos semanales recurrentes.' },
    'faq.q4': { en: 'Can you help with color matching?', es: '¿Pueden ayudar con igualación de color?' },
    'faq.a4': { en: 'Absolutely—share Pantone references or merch photos and we’ll dial in the color profile before printing. Hard proofing is available on request.', es: 'Claro—comparte referencias Pantone o fotos y ajustamos el perfil de color antes de imprimir. Pruebas físicas disponibles bajo solicitud.' },
    'faq.q5': { en: 'What heat press settings do you recommend?', es: '¿Qué configuración de prensa de calor recomiendan?' },
    'faq.a5': { en: 'Most transfers press at 285°F for 12 seconds with medium pressure. We include a cheat sheet with every order to fit your equipment.', es: 'La mayoría de las transferencias se prensan a 285°F por 12 segundos con presión media. Incluimos una guía con cada pedido para tu equipo.' },
    'faq.q6': { en: 'Do you offer fulfillment or finishing?', es: '¿Ofrecen empaquetado o acabado?' },
    'faq.a6': { en: 'Yes, we can press, fold, bag, tag, and ship to your customer under your brand. Let us know what you need in the notes or contact form.', es: 'Sí, podemos prensar, doblar, empacar, etiquetar y enviar a tu cliente bajo tu marca. Dinos lo que necesitas en las notas o el formulario de contacto.' },

    // Contact
    'contact.h2': { en: 'Kick Off Your Next Production Run', es: 'Inicia Tu Próxima Producción' },
    'contact.formH3': { en: 'Send project details', es: 'Envía los detalles del proyecto' },
    'contact.namePh': { en: 'Name', es: 'Nombre' },
    'contact.emailPh': { en: 'Email*', es: 'Correo electrónico*' },
    'contact.uploadLabel': { en: 'Upload artwork files', es: 'Subir archivos de diseño' },
    'contact.noFile': { en: 'No file chosen', es: 'Ningún archivo elegido' },
    'contact.messagePh': { en: 'Tell us about quantities, timelines, and finishing needs', es: 'Cuéntanos sobre cantidades, tiempos y necesidades de acabado' },
    'contact.submit': { en: 'Send Message', es: 'Enviar Mensaje' },
    'contact.recaptcha': { en: 'This site is protected by reCAPTCHA and the Google', es: 'Este sitio está protegido por reCAPTCHA y aplican la' },
    'contact.privacy': { en: 'Privacy Policy', es: 'Política de Privacidad' },
    'contact.and': { en: 'and', es: 'y los' },
    'contact.terms': { en: 'Terms of Service', es: 'Términos de Servicio de Google' },
    'contact.apply': { en: 'apply.', es: '.' },
    'contact.visitH3': { en: 'Visit the production studio', es: 'Visita el estudio de producción' },
    'contact.visitP': { en: "We love walk-ins—bring your ideas, blank garments, or proofs and we’ll craft a plan while you wait.", es: 'Nos encantan las visitas sin cita—trae tus ideas, prendas en blanco o pruebas y armamos un plan mientras esperas.' },
    'contact.hoursH4': { en: 'Hours', es: 'Horario' },
    'contact.hours1': { en: 'Mon - Fri: 09:00 am – 05:00 pm', es: 'Lun - Vie: 9:00 am – 5:00 pm' },
    'contact.hours2': { en: 'Sat - Sun: Closed', es: 'Sáb - Dom: Cerrado' },
    'contact.callH4': { en: 'Call Us', es: 'Llámanos' },

    // Subscribe
    'subscribe.h3': { en: 'Stay Updated!', es: '¡Mantente al Día!' },
    'subscribe.p': { en: 'Subscribe for printer tips, launch guides, and early access to specialty finishes.', es: 'Suscríbete para recibir consejos de impresión, guías de lanzamiento y acceso anticipado a acabados especiales.' },
    'subscribe.ph': { en: 'Your Email', es: 'Tu Correo Electrónico' },
    'subscribe.btn': { en: 'Sign Up', es: 'Suscribirse' },

    // Footer
    'footer.copyright': { en: 'Copyright © 2026 Asigns & Printing - All Rights Reserved.', es: 'Derechos de Autor © 2026 Asigns & Printing - Todos los Derechos Reservados.' },
    'footer.guides': { en: 'Guides', es: 'Guías' },
    'footer.stickyCta': { en: 'Start a Project', es: 'Iniciar un Proyecto' },
    'cookie.text': { en: 'This website uses cookies to analyze website traffic and optimize your website experience. By accepting our use of cookies, your data will be aggregated with all other user data.', es: 'Este sitio web usa cookies para analizar el tráfico y optimizar tu experiencia. Al aceptar el uso de cookies, tus datos se combinarán con los de otros usuarios.' },
    'cookie.accept': { en: 'Accept', es: 'Aceptar' },

    // Subpage hero (shared pattern, page-specific keys below)
    'tools.eyebrow': { en: 'Tools', es: 'Herramientas' },
    'gangHero.h1': { en: 'Build and proof your DTF gang sheets online.', es: 'Crea y revisa tus gang sheets DTF en línea.' },
    'gangHero.p': { en: 'Upload artwork, arrange placements, and send the full spec sheet directly to our production team. The builder keeps sizing, notes, and contact details together so nothing gets lost.', es: 'Sube tu diseño, organiza la colocación y envía la hoja de especificaciones directo a producción. El creador mantiene todo junto para que nada se pierda.' },
    'gangHero.btn1': { en: 'View Pricing', es: 'Ver Precios' },
    'gangHero.btn2': { en: 'Talk with production', es: 'Habla con producción' },

    'teeHero.h1': { en: 'Visualize apparel runs before they hit the press.', es: 'Visualiza tus pedidos de ropa antes de imprimir.' },
    'teeHero.p': { en: "Use the Tee Designer to test garment colors, artwork placements, and text treatments. Share the mockup with our team when you’re ready to quote or schedule production.", es: 'Usa el Diseñador de Playeras para probar colores, colocación de diseño y texto. Comparte tu mockup con nuestro equipo cuando estés listo para cotizar o agendar producción.' },
    'teeHero.btn1': { en: 'See Apparel Services', es: 'Ver Servicios de Ropa' },
    'teeHero.btn2': { en: 'Submit a project', es: 'Enviar un proyecto' },

    'shopHero.eyebrow': { en: 'Shop', es: 'Tienda' },
    'shopHero.h1': { en: 'Everything we print, in one place.', es: 'Todo lo que imprimimos, en un solo lugar.' },
    'shopHero.p': { en: 'Add products to your cart, tell us the details, and our production team will follow up with a firm quote and timeline — no account needed.', es: 'Agrega productos a tu carrito, cuéntanos los detalles y nuestro equipo te contactará con un precio final y tiempo de entrega — sin necesidad de cuenta.' },

    'resourcesHero.eyebrow': { en: 'Guides', es: 'Guías' },
    'resourcesHero.h1': { en: 'DTF Printing Guides & Resources', es: 'Guías y Recursos de Impresión DTF' },
    'resourcesHero.p': { en: "Everything we tell customers over the counter — now written down so you can prep your files right the first time.", es: 'Todo lo que le decimos a nuestros clientes en persona — ahora por escrito para que prepares tus archivos bien desde la primera vez.' },

    // Shared UI chrome
    'ui.goToTop': { en: 'Go to top', es: 'Ir arriba' },
    'ui.close': { en: 'Close', es: 'Cerrar' },
    'ui.fullName': { en: 'Full name', es: 'Nombre completo' },
    'ui.email': { en: 'Email', es: 'Correo electrónico' },
    'ui.phoneOptional': { en: 'Phone (optional)', es: 'Teléfono (opcional)' },

    // Shop page
    'shop.categories': { en: 'Categories', es: 'Categorías' },
    'shop.filterAll': { en: 'All Products', es: 'Todos los Productos' },
    'shop.filterDtf': { en: 'DTF Gang Sheets', es: 'Gang Sheets DTF' },
    'shop.filterApparel': { en: 'Custom Apparel', es: 'Ropa Personalizada' },
    'shop.filterSigns': { en: 'Signs & Banners', es: 'Letreros y Banners' },
    'shop.filterVehicle': { en: 'Vehicle Graphics', es: 'Rotulación Vehicular' },
    'shop.filterVinyl': { en: 'Vinyl & Lettering', es: 'Vinil y Letras' },
    'shop.filterVinylLettering': { en: 'Vinyl Lettering', es: 'Letras de Vinil' },
    'shop.filterTint': { en: 'Window Tint', es: 'Polarizado de Ventanas' },
    'shop.filterPrinting': { en: 'Printing Services', es: 'Servicios de Impresión' },
    'shop.filterDesign': { en: 'Graphic Design', es: 'Diseño Gráfico' },
    'shop.filterWeb': { en: 'Website Creation', es: 'Creación de Sitios Web' },
    'shop.filterBranding': { en: 'Business Branding', es: 'Branding de Negocio' },
    'shop.filterPackages': { en: 'Packages', es: 'Paquetes' },
    'shop.cartCheckout': { en: 'Request Quote / Order', es: 'Solicitar Cotización / Pedido' },
    'shop.orderSheetH3': { en: 'Send Your Order Request', es: 'Enviar Solicitud de Pedido' },
    'shop.orderSheetNote': { en: "We'll confirm firm pricing, artwork requirements, and turnaround by email or phone.", es: 'Confirmaremos el precio final, requisitos de diseño y tiempo de entrega por correo o teléfono.' },
    'shop.orderNotesLabel': { en: 'Notes (quantities, artwork, deadlines)', es: 'Notas (cantidades, diseño, fechas límite)' },
    'shop.orderSubmit': { en: 'Send Order Request', es: 'Enviar Solicitud de Pedido' },
    'shop.paymentH4': { en: 'Payment via Zelle', es: 'Pago por Zelle' },
    'shop.paymentInfoPre': { en: 'Once we confirm your final price, send payment via Zelle to', es: 'Una vez confirmemos tu precio final, envía el pago por Zelle al' },
    'shop.paymentInfoPost': { en: "using your bank's app — no account setup needed on your end.", es: 'desde la app de tu banco — no necesitas crear ninguna cuenta.' },
    'shop.paidCheckbox': { en: "I've already sent payment via Zelle", es: 'Ya envié el pago por Zelle' },
    // Dynamic (used by shop.js via window.t)
    'shop.addToCart': { en: 'Add to Cart', es: 'Agregar al Carrito' },
    'shop.openTool': { en: 'Open design tool →', es: 'Abrir herramienta →' },
    'shop.tbdQuote': { en: 'TBD — contact for quote', es: 'Por confirmar — contáctanos' },
    'shop.freeQuote': { en: 'Free Quote', es: 'Cotización Gratis' },
    'shop.fromPrefix': { en: 'From ', es: 'Desde ' },
    'shop.items': { en: 'items', es: 'artículos' },
    'shop.item': { en: 'item', es: 'artículo' },
    'shop.emptyCart': { en: 'Your cart is empty. Add products to request a quote.', es: 'Tu carrito está vacío. Agrega productos para solicitar una cotización.' },
    'shop.quoteNeeded': { en: 'Quote needed', es: 'Cotización necesaria' },
    'shop.sending': { en: 'Sending your order request…', es: 'Enviando tu solicitud de pedido…' },
    'shop.orderSuccess': { en: "Thanks! We've got your order request and will follow up shortly.", es: '¡Gracias! Ya tenemos tu solicitud y te contactaremos pronto.' },
    'shop.orderError': { en: 'Something went wrong sending your request — please call or text us at 336-215-0518 instead.', es: 'Hubo un problema al enviar tu solicitud — mejor llámanos o envíanos un mensaje de texto al 336-215-0518.' },

    // Gang builder page
    'gang.h2': { en: 'Interactive DTF Gang Sheet Builder', es: 'Creador Interactivo de Gang Sheets DTF' },
    'gang.intro': { en: 'Upload your artwork, lay out your gang sheet, and send us everything we need to get your prints rolling.', es: 'Sube tu diseño, organiza tu gang sheet y envíanos todo lo necesario para empezar a imprimir.' },
    'gang.step1': { en: '1. Choose Sheet Size', es: '1. Elige el Tamaño de Hoja' },
    'gang.presetSize': { en: 'Preset size', es: 'Tamaño preestablecido' },
    'gang.custom': { en: 'Custom', es: 'Personalizado' },
    'gang.width': { en: 'Width (in)', es: 'Ancho (pulg)' },
    'gang.height': { en: 'Height (in)', es: 'Alto (pulg)' },
    'gang.applySize': { en: 'Apply Size', es: 'Aplicar Tamaño' },
    'gang.currentLayout': { en: 'Current layout:', es: 'Diseño actual:' },
    'gang.step2': { en: '2. Add Artwork & Text', es: '2. Agregar Diseño y Texto' },
    'gang.uploadArtwork': { en: 'Upload artwork (PNG recommended)', es: 'Subir diseño (PNG recomendado)' },
    'gang.addText': { en: 'Add Text', es: 'Agregar Texto' },
    'gang.text': { en: 'Text', es: 'Texto' },
    'gang.textPh': { en: 'Add text content', es: 'Escribe el texto' },
    'gang.color': { en: 'Color', es: 'Color' },
    'gang.fontSize': { en: 'Font size', es: 'Tamaño de fuente' },
    'gang.applyChanges': { en: 'Apply Changes', es: 'Aplicar Cambios' },
    'gang.step3': { en: '3. Manage Selection', es: '3. Administrar Selección' },
    'gang.duplicate': { en: 'Duplicate', es: 'Duplicar' },
    'gang.delete': { en: 'Delete', es: 'Eliminar' },
    'gang.bringForward': { en: 'Bring Forward', es: 'Traer al Frente' },
    'gang.sendBackward': { en: 'Send Backward', es: 'Enviar Atrás' },
    'gang.tip': { en: 'Tip: Click any item on the sheet to move, resize, or rotate it.', es: 'Consejo: Haz clic en cualquier elemento para moverlo, cambiar su tamaño o rotarlo.' },
    'gang.step4': { en: '4. Order Details', es: '4. Detalles del Pedido' },
    'gang.quantity': { en: 'Sheet quantity', es: 'Cantidad de hojas' },
    'gang.notesLabel': { en: 'Notes for our team', es: 'Notas para nuestro equipo' },
    'gang.notesPh': { en: 'Add any special instructions...', es: 'Agrega instrucciones especiales...' },
    'gang.preview': { en: 'Gang Sheet Preview', es: 'Vista Previa del Gang Sheet' },
    'gang.printableNote': { en: 'The grey border represents your printable area. Keep critical artwork away from the edge.', es: 'El borde gris representa tu área imprimible. Mantén el diseño importante alejado del borde.' },
    'gang.download': { en: 'Download Layout', es: 'Descargar Diseño' },
    'gang.clear': { en: 'Clear Sheet', es: 'Limpiar Hoja' },
    'gang.sendOrder': { en: 'Send Your Order Request', es: 'Enviar Solicitud de Pedido' },
    'gang.shipDate': { en: 'Desired ship date', es: 'Fecha de envío deseada' },
    'gang.sendRequest': { en: 'Send Order Request', es: 'Enviar Solicitud de Pedido' },
    'gang.needFinishing': { en: 'Need finishing or logistics support?', es: '¿Necesitas ayuda con acabado o logística?' },
    'gang.finishingP': { en: 'Attach your exported layout when you reach out and our production coordinators will confirm pricing, delivery windows, and finishing options.', es: 'Adjunta tu diseño exportado cuando nos contactes y nuestros coordinadores confirmarán precio, tiempos de entrega y opciones de acabado.' },
    'gang.contactProduction': { en: 'Contact Production', es: 'Contactar Producción' },

    // Tee designer page
    'tee.h2': { en: 'Interactive T-Shirt Designer', es: 'Diseñador Interactivo de Playeras' },
    'tee.intro': { en: 'Mock up custom tees in seconds. Pick a garment color, drop in your art, and see how it presses before we hit the printer.', es: 'Diseña playeras personalizadas en segundos. Elige un color, agrega tu diseño y ve cómo queda antes de imprimir.' },
    'tee.step1': { en: '1. Choose Garment Color', es: '1. Elige el Color de la Prenda' },
    'tee.step2': { en: '2. Add Artwork', es: '2. Agregar Diseño' },
    'tee.uploadArtwork': { en: 'Upload PNG / JPG', es: 'Subir PNG / JPG' },
    'tee.dragHelper': { en: 'Drag design layers to reposition and scale them inside the printable window.', es: 'Arrastra las capas de diseño para moverlas y ajustar su tamaño dentro del área imprimible.' },
    'tee.step3': { en: '3. Add Text', es: '3. Agregar Texto' },
    'tee.text': { en: 'Text', es: 'Texto' },
    'tee.textPh': { en: 'Enter message', es: 'Escribe el mensaje' },
    'tee.font': { en: 'Font', es: 'Fuente' },
    'tee.color': { en: 'Color', es: 'Color' },
    'tee.addText': { en: 'Add Text', es: 'Agregar Texto' },
    'tee.reset': { en: 'Reset', es: 'Reiniciar' },
    'tee.download': { en: 'Download Mockup', es: 'Descargar Mockup' },
    'tee.orderIntro': { en: "Download your mockup for reference, then send us the details below and we'll follow up with pricing and turnaround.", es: 'Descarga tu mockup de referencia y envíanos los detalles a continuación — te contactaremos con precio y tiempo de entrega.' },
    'tee.quantity': { en: 'Quantity', es: 'Cantidad' },
    'tee.notesLabel': { en: 'Notes for our team', es: 'Notas para nuestro equipo' },
    'tee.notesPh': { en: 'Garment style, sizes needed, deadline...', es: 'Estilo de prenda, tallas necesarias, fecha límite...' },
    'tee.sendOrder': { en: 'Send Order Request', es: 'Enviar Solicitud de Pedido' },
    'tee.readyH3': { en: 'Ready to produce your apparel run?', es: '¿Listo para producir tu pedido de ropa?' },
    'tee.readyP': { en: "Send your mockup and notes to our team and we'll confirm print specs, finishing, and delivery dates.", es: 'Envía tu mockup y notas a nuestro equipo y confirmaremos especificaciones, acabado y fechas de entrega.' },

    // Resources page
    'resources.article1H2': { en: 'How to Prep Your Artwork for DTF Printing', es: 'Cómo Preparar tu Diseño para Impresión DTF' },
    'resources.article1Intro': { en: "Getting your file right the first time saves a round of back-and-forth before your gang sheet goes to print. Here's what we look for:", es: 'Preparar bien tu archivo desde el principio evita idas y venidas antes de imprimir tu gang sheet. Esto es lo que buscamos:' },
    'resources.li1': { en: 'File type: Transparent PNG, TIFF, or vector PDF work best. If you only have a JPEG or need cleanup, send what you have — we can help prep it.', es: 'Tipo de archivo: Transparente PNG, TIFF o PDF vectorial funcionan mejor. Si solo tienes JPEG o necesitas ayuda, envíanos lo que tengas.' },
    'resources.li2': { en: 'Resolution: 300 DPI at the size you want it printed. Scaling up a low-res image will show on press.', es: 'Resolución: 300 DPI al tamaño que quieras imprimir. Ampliar una imagen de baja resolución se notará en la impresión.' },
    'resources.li3': { en: "Background: Keep it transparent unless the design is meant to have a solid background — DTF only prints what's in the file.", es: 'Fondo: Mantenlo transparente a menos que el diseño lleve fondo sólido — DTF solo imprime lo que está en el archivo.' },
    'resources.li4': { en: "Color matching: Share Pantone references or product photos if brand color accuracy matters, and we'll dial in the color profile before printing.", es: 'Igualación de color: Comparte referencias Pantone o fotos si la precisión del color importa, y ajustamos el perfil antes de imprimir.' },
    'resources.li5': { en: 'Layout: No minimums on gang sheets — use the Gang Sheet Builder to arrange multiple designs on one sheet and see exactly how much space each one uses.', es: 'Diseño: Sin mínimos en gang sheets — usa el Creador de Gang Sheets para organizar varios diseños en una hoja y ver el espacio que ocupa cada uno.' },
    'resources.article2H2': { en: 'Recommended Heat Press Settings for DTF Transfers', es: 'Configuración Recomendada de Prensa de Calor para Transferencias DTF' },
    'resources.article2Intro': { en: "Every transfer we send out includes a cheat sheet, but here's the baseline setting that works for most fabrics:", es: 'Cada transferencia incluye una guía, pero esta es la configuración base que funciona para la mayoría de las telas:' },
    'resources.temp': { en: 'Temperature: 285°F', es: 'Temperatura: 285°F' },
    'resources.time': { en: 'Time: 12 seconds', es: 'Tiempo: 12 segundos' },
    'resources.pressure': { en: 'Pressure: Medium', es: 'Presión: Media' },
    'resources.article2End': { en: "Peel cold once the transfer has cooled for the cleanest release. If you're pressing a heat-sensitive fabric (like some polyester blends), test on a scrap piece first or", es: 'Despega en frío una vez que la transferencia se haya enfriado para un mejor resultado. Si prensas una tela sensible al calor, prueba primero en un retazo o' },
    'resources.contactUs': { en: 'contact us', es: 'contáctanos' },
    'resources.article2End2': { en: "— we're happy to walk through settings for your specific garment.", es: '— con gusto te ayudamos con la configuración para tu prenda.' },
    'resources.readyH3': { en: 'Ready to send us a file?', es: '¿Listo para enviarnos un archivo?' },
    'resources.readyP': { en: 'Build your layout in the Gang Sheet Builder or reach out with questions before you order.', es: 'Crea tu diseño en el Creador de Gang Sheets o contáctanos con preguntas antes de ordenar.' },
  };

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
    return navigator.language && navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function t(key) {
    const lang = getLang();
    const entry = DICT[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const entry = DICT[key];
      if (entry) el.textContent = entry[lang] || entry.en;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const entry = DICT[key];
      if (entry) el.setAttribute('placeholder', entry[lang] || entry.en);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const entry = DICT[key];
      if (entry) el.setAttribute('aria-label', entry[lang] || entry.en);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const entry = DICT[key];
      if (entry) el.setAttribute('title', entry[lang] || entry.en);
    });

    document.querySelectorAll('.lang-toggle-label').forEach((el) => {
      el.textContent = lang === 'en' ? 'Español' : 'English';
    });

    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Spanish' : 'Switch to English');
    });

    document.dispatchEvent(new CustomEvent('asignsLangChange', { detail: { lang } }));
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  }

  function init() {
    const lang = getLang();
    applyLanguage(lang);

    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setLang(getLang() === 'en' ? 'es' : 'en');
      });
    });
  }

  window.t = t;
  window.getSiteLang = getLang;
  window.setSiteLang = setLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
