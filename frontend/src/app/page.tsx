"use client";

import React, { useState } from "react";
import {
  Gift,
  Mic,
  Heart,
  Star,
  ShoppingCart,
  Menu,
  X,
  Play,
  Volume2,
  Sparkles,
} from "lucide-react";

interface GiftCard {
  id: number;
  name: string;
  price: number;
  image: string;
  audioLength: string;
  category: string;
}

export default function GiftCardStore() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState<GiftCard[]>([]);

  const giftCards: GiftCard[] = [
    {
      id: 1,
      name: "Amor Eterno",
      price: 49.9,
      image:
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
      audioLength: "até 2 min",
      category: "Romântico",
    },
    {
      id: 2,
      name: "Parabéns Especial",
      price: 39.9,
      image:
        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop",
      audioLength: "até 1 min",
      category: "Aniversário",
    },
    {
      id: 3,
      name: "Gratidão Profunda",
      price: 44.9,
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
      audioLength: "até 90 seg",
      category: "Agradecimento",
    },
    {
      id: 4,
      name: "Celebração Premium",
      price: 79.9,
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      audioLength: "até 5 min",
      category: "Premium",
    },
    {
      id: 5,
      name: "Amizade Verdadeira",
      price: 34.9,
      image:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
      audioLength: "até 1 min",
      category: "Amizade",
    },
    {
      id: 6,
      name: "Momento Família",
      price: 54.9,
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
      audioLength: "até 3 min",
      category: "Família",
    },
  ];


  const addToCart = (product: GiftCard) => {
    setCart((prev) => [...prev, product]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 scroll-smooth">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                AudioGift
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#produtos"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Produtos
              </a>
              <a
                href="#como-funciona"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Como Funciona
              </a>
              <a
                href="#contato"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Contato
              </a>
              <button className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-purple-600 transition-colors" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </nav>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#produtos"
                className="block text-gray-700 hover:text-purple-600 font-medium"
              >
                Produtos
              </a>
              <a
                href="#como-funciona"
                className="block text-gray-700 hover:text-purple-600 font-medium"
              >
                Como Funciona
              </a>
              <a
                href="#contato"
                className="block text-gray-700 hover:text-purple-600 font-medium"
              >
                Contato
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Novidade: Gravar até 5 minutos de áudio
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Presentes que{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                falam por você
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transforme momentos especiais em memórias eternas. Envie gift cards personalizados com sua voz e emoção.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#produtos"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl py-4 px-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                Ver Gift Cards
              </a>
              <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl py-4 px-8 transition-all duration-300 shadow-md border-2 border-gray-200">
                <Play className="w-5 h-5" />
                Ver Demonstração
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=400&fit=crop"
                alt="Gift card"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <Mic className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Grave seu áudio</p>
                    <p className="text-sm text-gray-600">Até 5 minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Grave Sua Voz</h3>
              <p className="text-gray-600">Adicione mensagens de áudio personalizadas aos seus gift cards</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Designs Únicos</h3>
              <p className="text-gray-600">Escolha entre diversos modelos para cada ocasião especial</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Entrega Instantânea</h3>
              <p className="text-gray-600">Envie por email, WhatsApp ou gere um link para compartilhar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Nossos Gift Cards</h2>
          <p className="text-xl text-gray-600">
            Escolha o modelo perfeito para sua mensagem especial
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giftCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {card.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{card.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Áudio {card.audioLength}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-600">
                    R$ {card.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(card)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="como-funciona"
        className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Escolha o Card</h3>
              <p className="text-purple-100">Selecione o design perfeito</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Grave o Áudio</h3>
              <p className="text-purple-100">Deixe sua mensagem especial</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Personalize</h3>
              <p className="text-purple-100">Adicione texto e detalhes</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Envie!</h3>
              <p className="text-purple-100">Compartilhe o momento</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Pronto para criar algo especial?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Comece agora e surpreenda quem você ama com um presente único
          </p>
          <a
            href="#produtos"
            className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Star className="w-5 h-5" />
            Criar Meu Gift Card
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AudioGift</span>
              </div>
              <p className="text-sm">Transformando mensagens em memórias inesquecíveis</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produtos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gift Cards Românticos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Aniversários
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Agradecimentos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} AudioGift - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
