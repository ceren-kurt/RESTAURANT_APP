-- Sample data for Restaurant Order System
-- Run this after the migration to populate the database with sample data

-- Categories
INSERT INTO category (name, description, is_active) VALUES
('Ana Yemekler', 'Lezzetli ana yemeklerimiz', true),
('Baslangiclar', 'Aperatifler ve mezeler', true),
('Salatalar', 'Taze ve saglikli salatalar', true),
('Icecekler', 'Sicak ve soguk icecekler', true),
('Tatlilar', 'Ev yapimi tatlilarimiz', true),
('Pizzalar', 'Ozel soslu pizzalar', true),
('Burgerler', 'El yapimi burgerler', true);

-- Products for Ana Yemekler (category_id = 1)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Izgara Tavuk', 'Marine edilmis tavuk gogsu, garnitur ile', 145.00, true, 1),
('Kofte Tabagi', 'El yapimi kofte, pilav ve salata ile', 135.00, true, 1),
('Kuzu Pirzola', 'Izgara kuzu pirzola, patates pure ile', 195.00, true, 1),
('Somon Izgara', 'Taze somon fileto, sebze garnituru ile', 185.00, true, 1),
('Dana Biftek', 'Premium dana biftek, sos esliginde', 225.00, true, 1);

-- Products for Baslangiclar (category_id = 2)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Humus', 'Geleneksel humus, zeytinyagi ile', 45.00, true, 2),
('Mercimek Corbasi', 'Ev yapimi mercimek corbasi', 35.00, true, 2),
('Sigara Boregi', '4 adet el acmasi borek', 55.00, true, 2),
('Acili Ezme', 'Taze domates ve biber ezmesi', 40.00, true, 2),
('Karisik Meze', 'Gunun seçkin mezeleri', 95.00, true, 2);

-- Products for Salatalar (category_id = 3)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Sezar Salata', 'Klasik sezar salata, tavuk ile', 85.00, true, 3),
('Coban Salata', 'Taze mevsim salata', 45.00, true, 3),
('Akdeniz Salata', 'Zeytinli, peynirli Akdeniz salata', 75.00, true, 3),
('Ton Balikli Salata', 'Ton balik ile zenginlestirilmis salata', 95.00, true, 3);

-- Products for Icecekler (category_id = 4)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Kola', '330ml', 25.00, true, 4),
('Ayran', 'Ev yapimi ayran', 20.00, true, 4),
('Limonata', 'Taze sikma limonata', 35.00, true, 4),
('Turk Kahvesi', 'Geleneksel Turk kahvesi', 30.00, true, 4),
('Cay', 'Demlik cay', 15.00, true, 4),
('Su', '500ml', 10.00, true, 4);

-- Products for Tatlilar (category_id = 5)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Sutlac', 'Ev yapimi firinda sutlac', 45.00, true, 5),
('Baklava', '4 dilim fistikli baklava', 65.00, true, 5),
('Kunefe', 'Antep fistikli kunefe', 75.00, true, 5),
('Tiramisu', 'Italyan tiramisu', 55.00, true, 5),
('Cheesecake', 'New York usulu cheesecake', 60.00, true, 5);

-- Products for Pizzalar (category_id = 6)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Margarita Pizza', 'Domates sosu, mozzarella, fesleğen', 115.00, true, 6),
('Karisik Pizza', 'Sucuk, mantar, biber, sogan, zeytin', 145.00, true, 6),
('Pepperoni Pizza', 'Pepperoni, mozzarella', 135.00, true, 6),
('Vejeteryan Pizza', 'Mevsim sebzeleri', 125.00, true, 6);

-- Products for Burgerler (category_id = 7)
INSERT INTO product (name, description, price, is_available, category_id) VALUES
('Klasik Burger', '150gr dana kofte, marul, domates', 95.00, true, 7),
('Cheese Burger', 'Cheddar peynirli burger', 105.00, true, 7),
('Double Burger', 'Cift kofte, cift peynir', 135.00, true, 7),
('Tavuk Burger', 'Izgara tavuk burger', 85.00, true, 7),
('Vegan Burger', 'Bitki bazli kofte', 95.00, true, 7);

-- Restaurant Tables
INSERT INTO restaurant_table (table_number, capacity, status) VALUES
('A1', 2, 'available'),
('A2', 2, 'available'),
('A3', 4, 'available'),
('B1', 4, 'available'),
('B2', 4, 'available'),
('B3', 6, 'available'),
('C1', 6, 'available'),
('C2', 8, 'available'),
('VIP1', 10, 'available'),
('VIP2', 12, 'available');
