        let map;
        let markers = [];
        let markerClusterGroup = null;
        
        // User's saved data is preserved - no automatic clearing
        // Use "Reset to Demo Data" in Settings if you want to reload default positions
        
        let restaurants = JSON.parse(localStorage.getItem('restaurants')) || [
            // === DINA RIKTIGA RESTAURANGER ===
            // Justera lat/lng för att flytta pins på kartan
            {
                id: 1,
                name: "Bruschetta",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Stora stranden",
                address: "Šetalište Dr. Franje Tuđmana 10",
                lat: 43.2948,
                lng: 17.0198,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Italiensk, pizza och pasta",
                foodItems: [
                    { name: "Bruschetta", category: "appetizer", rating: 4, price: "", comment: "" },
                    { name: "Carbonara", category: "pasta", rating: 3, price: "", comment: "god men ej smak av Carbonara" },
                    { name: "Bolognese", category: "pasta", rating: 4, price: "", comment: "god!" },
                    { name: "Gnocchi gorgonzola", category: "pasta", rating: 4, price: "", comment: "god" },
                    { name: "Kalkonsallad", category: "salad", rating: 5, price: "", comment: "väldigt god!" },
                    { name: "Pizza bianco Kulen", category: "pizza", rating: 5, price: "", comment: "väldigt god!" },
                    { name: "Petto di pollo tartufo", category: "meat", rating: 5, price: "", comment: "svingod sås!" },
                    { name: "Lasagne lax spenat", category: "pasta", rating: 3.5, price: "", comment: "helt okej, god" }
                ]
            },
            {
                id: 2,
                name: "Mucrum",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Centrum",
                address: "Šetalište Dr. Franje Tuđmana 14",
                lat: 43.2952,
                lng: 17.0178,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Italiensk",
                foodItems: [
                    { name: "Carbonara", category: "pasta", rating: 4, price: "", comment: "god! Smak av ägg och parmesan" },
                    { name: "Husets vita vin", category: "wine", rating: 4, price: "", comment: "gott" },
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "okej" }
                ]
            },
            {
                id: 3,
                name: "Hops",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Riva",
                address: "Marineta 7",
                lat: 43.2957,
                lng: 17.0168,
                price: 3,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "God mat, varierat meny, eget bryggeri",
                foodItems: [
                    { name: "Tacos", category: "mexican", rating: 4, price: "", comment: "god" },
                    { name: "Öl Biokovo", category: "beer", rating: 4, price: "", comment: "god" },
                    { name: "Teleće pečenje (veal roast)", category: "meat", rating: 5, price: "", comment: "gott!! med potatis och kål" },
                    { name: "Veggie salad", category: "salad", rating: 5, price: "", comment: "mycket god!" },
                    { name: "Cevapi", category: "meat", rating: 4, price: "", comment: "bra köttsmak, med ljepinja" },
                    { name: "Bruntastic sandwich", category: "sandwich", rating: 4.5, price: "", comment: "god!! Gott bröd" }
                ]
            },
            {
                id: 4,
                name: "Europa",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Centrum",
                address: "Kalalarga",
                lat: 43.2954,
                lng: 17.0180,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Soppa", category: "soup", rating: 3, price: "", comment: "okej" },
                    { name: "Cevapi", category: "meat", rating: 2, price: "", comment: "4 av 10" }
                ]
            },
            {
                id: 5,
                name: "Lemon Garden",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Stora stranden",
                address: "Šetalište Dr. Franje Tuđmana 10-11",
                lat: 43.2945,
                lng: 17.0205,
                price: 2,
                foodRating: 4,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "Mindre sallad än på bilden",
                foodItems: [
                    { name: "Kalkonfilet med kroketter", category: "meat", rating: 5, price: "", comment: "jättegod!" },
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "okej, mycket sås" },
                    { name: "Kycklingsallad", category: "salad", rating: 4, price: "", comment: "god" },
                    { name: "Ljetna salata kyckling", category: "salad", rating: 4, price: "", comment: "matig och god" }
                ]
            },
            {
                id: 6,
                name: "Berlin",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Stora stranden",
                address: "Šetalište Dr. Franje Tuđmana 13A",
                lat: 43.2943,
                lng: 17.0210,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "helt okej" },
                    { name: "Blandsallad", category: "salad", rating: 4, price: "", comment: "god dressing" },
                    { name: "Lax och räkpasta", category: "pasta", rating: 4, price: "", comment: "god!" },
                    { name: "Toast", category: "breakfast", rating: 3.5, price: "", comment: "" }
                ]
            },
            {
                id: 7,
                name: "Dinners Delight",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Stora stranden",
                address: "Šetalište Dr. Franje Tuđmana 13",
                lat: 43.2941,
                lng: 17.0215,
                price: 2,
                foodRating: 4,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "30 min väntan ibland",
                foodItems: [
                    { name: "Kycklingsallad", category: "salad", rating: 4, price: "", comment: "väldigt god kyckling" },
                    { name: "Kyckling avokado sallad", category: "salad", rating: 5, price: "", comment: "mycket god!!" },
                    { name: "Čevapi med kajmak", category: "meat", rating: 4, price: "", comment: "gott!" },
                    { name: "Pasta siciliana", category: "pasta", rating: 5, price: "", comment: "5/5 krämig god!!!" },
                    { name: "Schnitzel med svampsås", category: "meat", rating: 4, price: "", comment: "väldigt god sås!" }
                ]
            },
            {
                id: 8,
                name: "Matteo",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Centrum",
                address: "Put Cvitačke 6",
                lat: 43.2958,
                lng: 17.0165,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Weinerschnitzel", category: "meat", rating: 3, price: "", comment: "helt okej" },
                    { name: "Pasta fyra ostar", category: "pasta", rating: 3, price: "", comment: "helt okej" }
                ]
            },
            {
                id: 9,
                name: "Sloppy Joe",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Centrum",
                address: "Marineta ul.",
                lat: 43.2960,
                lng: 17.0168,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Ćevapi", category: "meat", rating: 3, price: "", comment: "okej, be om kajmak och ajvar" }
                ]
            },
            {
                id: 10,
                name: "Franco",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Riva",
                address: "Obala Kralja Tomislava 7",
                lat: 43.2968,
                lng: 17.0175,
                price: 2,
                foodRating: 3,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Bra service, utspädd sprit",
                foodItems: [
                    { name: "Kyckling risotto", category: "risotto", rating: 3.5, price: "", comment: "helt okej, god" },
                    { name: "Kycklingpasta", category: "pasta", rating: 4, price: "", comment: "god!" },
                    { name: "Lasagne", category: "pasta", rating: 3.5, price: "", comment: "god men lite krydda" },
                    { name: "Weinerschnitzel", category: "meat", rating: 1, price: "", comment: "underkänt!" }
                ]
            },
            {
                id: 11,
                name: "Bolero",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Centrum",
                address: "Marineta ul. (sista innan Dalmacija)",
                lat: 43.2956,
                lng: 17.0162,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Kycklingsallad", category: "salad", rating: 3, price: "", comment: "för mycket sås" },
                    { name: "Bolognese", category: "pasta", rating: 2, price: "", comment: "2/5" }
                ]
            },
            {
                id: 12,
                name: "Restoran Marina",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Riva",
                address: "Marineta ul. 11",
                lat: 43.2955,
                lng: 17.0170,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Bra service! Goda pizzor!",
                foodItems: [
                    { name: "Pizza bianco Quattro formaggio", category: "pizza", rating: 4.5, price: "", comment: "4.5/5" },
                    { name: "Pizza prosciutto", category: "pizza", rating: 5, price: "", comment: "mycket god!" },
                    { name: "Risotto seafood", category: "risotto", rating: 4, price: "", comment: "god smak" }
                ]
            },
            {
                id: 13,
                name: "Cajeta",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Tučepi",
                address: "Tučepi",
                lat: 43.2700,
                lng: 17.0550,
                price: 3,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Räkrisotto soltorkade tomater", category: "risotto", rating: 4, price: "", comment: "god!" },
                    { name: "Bolognese", category: "pasta", rating: 4, price: "", comment: "klart godkänd!" },
                    { name: "Lasagne", category: "pasta", rating: 5, price: "", comment: "10/10" }
                ]
            },
            {
                id: 14,
                name: "Hotel Milenij",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Centrum",
                address: "Šetalište Dr. Franje Tuđmana",
                lat: 43.2950,
                lng: 17.0195,
                price: 3,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "lite överkokt" },
                    { name: "Räkrisotto", category: "risotto", rating: 3, price: "", comment: "överkokta räkor" }
                ]
            },
            {
                id: 15,
                name: "Tempera",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Lilla stranden",
                address: "Lilla stranden/Donja Luka",
                lat: 43.2980,
                lng: 17.0155,
                price: 2,
                foodRating: 4,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "God mat men lång väntan",
                foodItems: [
                    { name: "Mat", category: "general", rating: 4, price: "", comment: "God mat men lång väntan" }
                ]
            },
            {
                id: 16,
                name: "Centrum",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Centrum",
                address: "Kalalarga/Trg",
                lat: 43.2955,
                lng: 17.0182,
                price: 2,
                foodRating: 4,
                serviceRating: 5,
                visitDate: "2024-09-01",
                notes: "Mycket bra service!",
                foodItems: [
                    { name: "Räkpasta", category: "pasta", rating: 4, price: "", comment: "4/5" },
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "3/5" }
                ]
            },
            {
                id: 17,
                name: "Gastro Diva",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Centrum",
                address: "Kalalarga 22",
                lat: 43.2951,
                lng: 17.0202,
                price: 3,
                foodRating: 5,
                serviceRating: 5,
                visitDate: "2024-09-01",
                notes: "Bra service, varmt kl 19",
                foodItems: [
                    { name: "Beefsteak rostad potatis", category: "meat", rating: 4, price: "", comment: "god" },
                    { name: "Veal neck potato mash", category: "meat", rating: 5, price: "", comment: "svingott!!" },
                    { name: "Stone bass fillet", category: "seafood", rating: 5, price: "", comment: "svingott!" },
                    { name: "Vin malvazija benvenuti", category: "wine", rating: 4.5, price: "", comment: "gott" }
                ]
            },
            {
                id: 18,
                name: "Amadeus",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Buba beach",
                address: "Buba beach",
                lat: 43.2920,
                lng: 17.0240,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Cevapi med lepinja", category: "meat", rating: 3.5, price: "", comment: "okej!" },
                    { name: "Kycklingsandwich", category: "sandwich", rating: 4, price: "", comment: "hel filé, god!" },
                    { name: "Pizza quattro formaggio", category: "pizza", rating: 4, price: "", comment: "goda!" },
                    { name: "Schnitzel svampsås", category: "meat", rating: 4.5, price: "", comment: "väldigt bra smak!" },
                    { name: "Bolognese", category: "pasta", rating: 4, price: "", comment: "god!" }
                ]
            },
            {
                id: 19,
                name: "Po&Po",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Riva",
                address: "Obala Kralja Tomislava (efter Bruschetta)",
                lat: 43.2946,
                lng: 17.0200,
                price: 2,
                foodRating: 3,
                serviceRating: 2,
                visitDate: "2024-09-01",
                notes: "Långsam service, bra fläktar",
                foodItems: [
                    { name: "Tagliatelle med räkor", category: "pasta", rating: 3, price: "", comment: "räkorna dåliga" },
                    { name: "Bolognese", category: "pasta", rating: 2, price: "", comment: "smaklös" }
                ]
            },
            {
                id: 20,
                name: "Casa Blanka",
                mainCategory: "restaurant",
                cuisine: "Mediterranean",
                area: "Riva",
                address: "Obala Kralja Tomislava (fin innergård)",
                lat: 43.2972,
                lng: 17.0180,
                price: 3,
                foodRating: 5,
                serviceRating: 5,
                visitDate: "2024-09-01",
                notes: "Mysigt! Bra service!",
                foodItems: [
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "3/5" },
                    { name: "Tagliatelle with shrimps", category: "pasta", rating: 5, price: "", comment: "svingod! Bästa i Makarska 9/10" },
                    { name: "Vitt vin kapja bilo", category: "wine", rating: 4, price: "", comment: "gott husets" }
                ]
            },
            {
                id: 21,
                name: "Herc",
                mainCategory: "restaurant",
                cuisine: "Seafood",
                area: "Riva",
                address: "Šetalište Dr. Franje Tuđmana 3a",
                lat: 43.2970,
                lng: 17.0145,
                price: 3,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Orada na dalmantski", category: "seafood", rating: 4.5, price: "", comment: "alltid god" },
                    { name: "Schnitzel svampsås mos", category: "meat", rating: 4, price: "", comment: "gott!" },
                    { name: "Lasagne", category: "pasta", rating: 4, price: "", comment: "god, bra smak" },
                    { name: "Köttallrik", category: "meat", rating: 5, price: "", comment: "mycket god!!" },
                    { name: "Cevapi", category: "meat", rating: 4, price: "", comment: "goda" },
                    { name: "Seabass", category: "seafood", rating: 4.5, price: "", comment: "god!" }
                ]
            },
            {
                id: 22,
                name: "Bura",
                mainCategory: "restaurant",
                cuisine: "Seafood",
                area: "Riva",
                address: "Obala Kralja Tomislava 23",
                lat: 43.2942,
                lng: 17.0155,
                price: 2,
                foodRating: 3,
                serviceRating: 3,
                visitDate: "2024-09-01",
                notes: "Lång tid att få mat",
                foodItems: [
                    { name: "Grillade räkor spaghetti", category: "seafood", rating: 3, price: "", comment: "med vitsås" },
                    { name: "Pljeskavica", category: "meat", rating: 3, price: "", comment: "" }
                ]
            },
            {
                id: 23,
                name: "Lavanda",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Centrum",
                address: "Kalalarga",
                lat: 43.2953,
                lng: 17.0185,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Bra service, bra lunchpriser",
                foodItems: [
                    { name: "Ravioli ost prosciutto tryffel", category: "pasta", rating: 3.5, price: "", comment: "7.5/10" },
                    { name: "Tagliatelle biff tryffel", category: "pasta", rating: 3.5, price: "", comment: "överkokt pasta" },
                    { name: "Vin kujunduža Grabovac", category: "wine", rating: 4, price: "", comment: "gott vitt" },
                    { name: "Seafood pasta", category: "pasta", rating: 3.5, price: "", comment: "god!" }
                ]
            },
            {
                id: 24,
                name: "Mr Wok",
                mainCategory: "restaurant",
                cuisine: "Asian",
                area: "Centrum",
                address: "Kalalarga",
                lat: 43.2957,
                lng: 17.0188,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Tortilla piletina", category: "mexican", rating: 4, price: "", comment: "god! Stor" },
                    { name: "Wok sesam", category: "asian", rating: 3, price: "", comment: "bra wok" },
                    { name: "Wok last kiss med ris", category: "asian", rating: 4, price: "", comment: "gott!" }
                ]
            },
            // === GLASS/ICE CREAM ===
            {
                id: 25,
                name: "Premis Glass",
                mainCategory: "icecream",
                cuisine: "Gelato",
                area: "Stora stranden",
                address: "Šetalište Dr. Franje Tuđmana (hörnet)",
                lat: 43.2940,
                lng: 17.0220,
                price: 1,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Rocker", category: "gelato", rating: 5, price: "", comment: "svingod chokladig lätt nötig" }
                ]
            },
            {
                id: 26,
                name: "Botanovic Sladoled",
                mainCategory: "icecream",
                cuisine: "Gelato",
                area: "Centrum",
                address: "Šetalište Dr. Franje Tuđmana 3",
                lat: 43.2968,
                lng: 17.0148,
                price: 1,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "",
                foodItems: [
                    { name: "Mango", category: "gelato", rating: 4.5, price: "", comment: "" },
                    { name: "Cheesecake", category: "gelato", rating: 4.5, price: "", comment: "" },
                    { name: "Pistage", category: "gelato", rating: 4.5, price: "", comment: "" },
                    { name: "Lime ginger", category: "gelato", rating: 4.5, price: "", comment: "" },
                    { name: "Salted caramel almond", category: "gelato", rating: 4, price: "", comment: "god!!" }
                ]
            },
            {
                id: 27,
                name: "Romana Kavana",
                mainCategory: "icecream",
                cuisine: "Gelato",
                area: "Centrum",
                address: "Kalalarga/Trg",
                lat: 43.2956,
                lng: 17.0184,
                price: 1,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Glass",
                foodItems: [
                    { name: "Lemon cheesecake glass", category: "gelato", rating: 5, price: "", comment: "mycket god!" },
                    { name: "Dolce latte caramel", category: "gelato", rating: 4, price: "", comment: "god!" },
                    { name: "Puhuljica kokos", category: "gelato", rating: 5, price: "", comment: "god!!!" },
                    { name: "Tiramisu pistage", category: "gelato", rating: 4, price: "", comment: "god!" }
                ]
            },
            {
                id: 28,
                name: "Gajeta",
                mainCategory: "restaurant",
                cuisine: "Croatian",
                area: "Centrum",
                address: "Kalalarga",
                lat: 43.2954,
                lng: 17.0186,
                price: 2,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Bra priser",
                foodItems: [
                    { name: "Pljeskavica med kroketter", category: "meat", rating: 4, price: "", comment: "gott! med ajvar" },
                    { name: "Bolognese", category: "pasta", rating: 3, price: "", comment: "okej!" },
                    { name: "Husets vita biokovo", category: "wine", rating: 4, price: "", comment: "gott, fruktig" }
                ]
            },
            {
                id: 29,
                name: "Basta",
                mainCategory: "restaurant",
                cuisine: "Italian",
                area: "Centrum",
                address: "Kalalarga",
                lat: 43.2952,
                lng: 17.0183,
                price: 2,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Goda pizzor! Riktigt bra",
                foodItems: [
                    { name: "Pizza Primavera", category: "pizza", rating: 4.5, price: "", comment: "väldigt god" },
                    { name: "Pizza Capricciosa", category: "pizza", rating: 3.5, price: "", comment: "helt okej! (Darko)" }
                ]
            },
            {
                id: 30,
                name: "Kantun",
                mainCategory: "icecream",
                cuisine: "Gelato",
                area: "Stora torget",
                address: "Trg Fra Andrije Kačića Miošića",
                lat: 43.2963,
                lng: 17.0192,
                price: 1,
                foodRating: 5,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Vid stora torget",
                foodItems: [
                    { name: "Pistage", category: "gelato", rating: 5, price: "", comment: "god, krämig" },
                    { name: "Choklad", category: "gelato", rating: 4, price: "", comment: "" },
                    { name: "Mango sorbet", category: "sorbet", rating: 3.5, price: "", comment: "god" },
                    { name: "Rafaello", category: "gelato", rating: 4.5, price: "", comment: "god!!" }
                ]
            },
            {
                id: 31,
                name: "Tempet",
                mainCategory: "icecream",
                cuisine: "Gelato",
                area: "Riva",
                address: "Obala Kralja Tomislava (vid fontänen)",
                lat: 43.2976,
                lng: 17.0186,
                price: 1,
                foodRating: 4,
                serviceRating: 4,
                visitDate: "2024-09-01",
                notes: "Gratis vatten",
                foodItems: [
                    { name: "Bananasplit", category: "gelato", rating: 4, price: "", comment: "god" }
                ]
            }
        ];

        // === DATA MIGRATION: Add mainCategory to old data ===
        // This fixes restaurants saved before mainCategory was added
        (function migrateMainCategory() {
            let needsSave = false;
            restaurants.forEach(restaurant => {
                // If the restaurant has an explicit category (chosen in the Add form),
                // that is the source of truth — keep mainCategory in sync with it.
                if (restaurant.category && restaurant.mainCategory !== restaurant.category) {
                    restaurant.mainCategory = restaurant.category;
                    needsSave = true;
                    return;
                }
                if (!restaurant.mainCategory) {
                    // Detect category based on cuisine/name
                    const cuisineLower = (restaurant.cuisine || '').toLowerCase();
                    const nameLower = (restaurant.name || '').toLowerCase();

                    if (cuisineLower.includes('gelato') || cuisineLower.includes('ice') ||
                        nameLower.includes('glass') || nameLower.includes('sladoled') ||
                        nameLower.includes('ice') || nameLower.includes('gelat')) {
                        restaurant.mainCategory = 'icecream';
                    } else if (cuisineLower.includes('dessert') || cuisineLower.includes('cake') ||
                               cuisineLower.includes('pastry') || cuisineLower.includes('bakery')) {
                        restaurant.mainCategory = 'dessert';
                    } else if (cuisineLower.includes('bar') || cuisineLower.includes('pub') ||
                               cuisineLower.includes('cafe') || cuisineLower.includes('coffee')) {
                        restaurant.mainCategory = 'drinks';
                    } else {
                        restaurant.mainCategory = 'restaurant';
                    }
                    needsSave = true;
                    console.log(`Migrated ${restaurant.name} to mainCategory: ${restaurant.mainCategory}`);
                }
            });
            if (needsSave) {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                console.log('Data migration complete: mainCategory added to all restaurants');
            }
        })();

        let currentRestaurantId = null;
        let _dishDetailLookup = {}; // stores dish objects keyed by dish.id for safe onclick refs
        let selectedLocation = null;
        let currentPinStyle = localStorage.getItem('pinStyle') || 'float-card';
        let selectedPinType = currentPinStyle;
        let currentFilter = 'none';

        const pinIcons = {
            classic: '📍',
            food: '🍽️',
            star: '⭐',
            chef: '👨‍🍳',
            pizza: '🍕',
            'fork-knife': '<div style="width: 38px; height: 38px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #f1f3f5; font-size: 20px;">🍴</div>',
            'hexagon-red': null,
            'hexagon-orange': null,
            'hexagon-yellow': null,
            'hexagon-purple': null,
            'hexagon-blue': null,
            'rating-badge': null
        };

        const cuisineColors = {
            'Croatian': '#ff6b6b',
            'Seafood': '#3498db',
            'Italian': '#27ae60',
            'Mediterranean': '#9b59b6',
            'Pizza': '#e67e22',
            'Steakhouse': '#c0392b',
            'Asian': '#f39c12',
            'Mexican': '#d35400',
            'Cafe': '#95a5a6',
            'International': '#16a085',
            'Bakery': '#f783ac',
            'Gelato': '#4dabf7',
            'Bar': '#9775fa'
        };

        // Main category colors for filter
        const mainCategoryColors = {
            'restaurant': '#ff6b6b',
            'dessert': '#f783ac',
            'icecream': '#4dabf7',
            'drinks': '#9775fa'
        };

        // Main category icons (emoji)
        const mainCategoryIcons = {
            'restaurant': '🍴',
            'dessert': '🍰',
            'icecream': '🍦',
            'drinks': '🍹'
        };

        // SVG icons for circle-dot style
        const mainCategorySvg = {
            'restaurant': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
            'dessert': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
            'icecream': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C9.01 2 6.5 4.37 6.5 7.5c0 .88.25 1.71.69 2.41L12 22l4.81-12.09c.44-.7.69-1.53.69-2.41C17.5 4.37 14.99 2 12 2zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 5.5 12 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
            'drinks': '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM5.66 5h12.69l-1.78 2H7.43l-1.77-2z"/></svg>'
        };

        const priceColors = {
            1: '#27ae60',
            2: '#f39c12',
            3: '#e74c3c',
            4: '#9b59b6'
        };

        const ratingColors = {
            5: '#27ae60',
            4: '#2ecc71',
            3: '#f39c12',
            2: '#e67e22',
            1: '#e74c3c'
        };

