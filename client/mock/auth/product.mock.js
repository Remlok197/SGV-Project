import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
  url: '/api/products',
  method: 'GET',
  body: {
    data: {
      categories: [
        { id: 1, name: "Alimentos", icon: "/assets/taco.svg" },
        { id: 2, name: "Bebidas", icon: "/assets/drink.svg" }
      ],
      products: [
        {
          id: 101,
          categoryId: 1,
          name: "Taco",
          price: 17.00,
          modifiers: ["carne", "salsa"],
          isAvailable: true,
          imageUrl: "/assets/products/taco.png" 
        },
        {
          id: 102,
          categoryId: 1,
          name: "Quesadilla",
          price: 25.00,
          modifiers: ["carne", "tortilla", "salsa"],
          isAvailable: true,
          imageUrl: "/assets/products/quesadilla_harina.png"
        },
        {
          id: 103,
          categoryId: 1,
          name: "Torta",
          price: 30.00,
          modifiers: ["carne", "salsa"],
          isAvailable: true,
          imageUrl: "/assets/products/torta.png"
        },
        {
          id: 104,
          categoryId: 1,
          name: "Volcán",
          price: 21.00,
          modifiers: ["carne", "salsa"],
          isAvailable: true,
          imageUrl: "/assets/products/volcan.png"
        },
        {
          id: 105,
          categoryId: 2,
          name: "Refresco vidrio",
          price: 21.00,
          modifiers: [],
          isAvailable: true,
          imageUrl: "/assets/products/refresco_vidrio.png"
        },
        {
          id: 106,
          categoryId: 2,
          name: "Refresco taparrosca",
          price: 27.00,
          modifiers: [],
          isAvailable: false,
          imageUrl: "/assets/products/refresco_taparrosca.png"
        },
        {
          id: 107,
          categoryId: 2,
          name: "Agua de sabor",
          price: 27.00,
          modifiers: ["tamaño"],
          isAvailable: false,
          imageUrl: "/assets/products/agua_sabor.png"
        },
        {
          id: 108,
          categoryId: 1,
          name: "Taco de tripa",
          price: 19.00,
          modifiers: ["carne", "salsa"],
          isAvailable: true,
          imageUrl: "/assets/products/taco_tripa.png"
        }
      ]
    },
    metadata: {
      totalItems: 8
    }
  }
});