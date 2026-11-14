#!/usr/bin/env python3
"""Generate the inner pages (services and case studies) in Bulgarian and English,
plus sitemap.xml.  All copy lives in this file; edit it here and run:

    python3 build-pages.py

Every text is a (Bulgarian, English) pair.  Never edit the generated .html files by hand.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = "https://sonikwebdesign.com/"
TODAY = "2026-11-15"
LANGS = ("bg", "en")
HOME = {"bg": "./", "en": "en.html"}
HOME_URL = {"bg": BASE, "en": BASE + "en.html"}
e = lambda s: html.escape(s, quote=True)

UI = {
    "work": ("Проекти", "Work"), "services": ("Услуги", "Services"), "pricing": ("Цени", "Pricing"),
    "process": ("Как работим", "Process"), "cta": ("Обсъдете проект", "Discuss a project"),
    "home": ("Начало", "Home"), "tagline": ("Прецизност. Характер. Присъствие.", "Precision. Character. Presence."),
    "made": ("Създадено с внимание в София.", "Crafted with care in Sofia."),
    "call": ("Запазете 15-минутен разговор", "Book a 15-minute call"),
    "quote": ("Поискайте оферта", "Request a quote"), "live": ("Посетете живия сайт", "Visit the live website"),
    "case": ("Вижте проекта", "View the case study"), "all_work": ("Всички проекти", "All projects"),
    "brief": ("Задачата", "The brief"), "built": ("Какво направихме", "What we built"),
    "industry": ("Индустрия", "Industry"), "location": ("Локация", "Location"), "scope": ("Обхват", "Scope"),
    "related_service": ("Свързана услуга", "Related service"), "more_work": ("Още проекти", "More work"),
    "included": ("Какво включва", "What is included"), "projects": ("Проекти в тази посока", "Projects in this field"),
    "faq": ("Чести въпроси", "Frequently asked questions"), "next": ("Следващата стъпка", "The next step"),
    "next_h": ("Нека поговорим за<br><em>Вашия проект.</em>", "Let’s talk about<br><em>your project.</em>"),
    "next_p": ("Разкажете ни накратко какво Ви трябва. Ще получите ясен обхват и писмена оферта, преди да започнем.",
               "Tell us briefly what you need. You get a clear scope and a written quote before any work begins."),
    "s_title": ("УСЛУГИ", "SERVICES"), "w_title": ("ПРОЕКТИ", "WORK"), "watch": ("Вижте сайта в движение", "See the website in motion"),
}

# ───────────────────────── case studies ─────────────────────────
PROJECTS = {
 "210-barber-studio": dict(
    name="210 Barber Studio", image="work-210-barber.webp", url="https://210barberstudio.com", service="barber",
    video=("demo-210-barber-studio.mp4", "work-210-barber.webp"),
    industry=("Барбершоп", "Barbershop"), location=("Сан Антонио, Тексас, САЩ", "San Antonio, Texas, USA"),
    scope=("Сайт · Резервации · Панел за собственика", "Website · Booking · Owner panel"),
    title=("Сайт за студио със<br><em>17 бръснари.</em>", "A website for a<br><em>17-barber studio.</em>"),
    lead=("210 Barber Studio е барбершоп в Сан Антонио със 17 бръснари. Сайтът помага на клиента да избере своя бръснар и го води направо към резервация — или го кани да влезе без час.",
          "210 Barber Studio is a 17-barber shop in San Antonio. The website helps a visitor pick their barber and sends them straight to booking — or invites them to walk in."),
    brief=("Всеки от 17-те бръснари има собствени клиенти, цени и страница за резервации. Сайтът трябваше да покаже целия екип на едно място, да отведе посетителя при правилния човек с едно докосване и да представи наградите от състезания, с които студиото се отличава. Собственикът трябваше да може сам да добавя бръснари и снимки, без да чака разработчик.",
           "Each of the 17 barbers has their own clients, prices and booking page. The website had to show the whole team in one place, take a visitor to the right barber in one tap, and present the competition trophies that set the shop apart. The owner also needed to add barbers and photos without waiting for a developer."),
    built=[
      (("Избор на бръснар", "Choose your barber"), ("Карта за всеки бръснар с начална цена и директен линк за резервация — Booksy, Square или theCut. Подреждане по цена.", "A card for every barber with a starting price and a direct booking link — Booksy, Square or theCut. Sortable by price.")),
      (("Галерия с прически", "Haircut gallery"), ("Секция „Fresh Out the Chair“ с преглед на цял екран и описание на всяка прическа.", "The “Fresh Out the Chair” section with full-screen view and a caption for every cut.")),
      (("Награди и състезания", "Awards and competitions"), ("Отделна галерия за трофеите и участията на екипа.", "A separate gallery for the team’s trophies and competition appearances.")),
      (("Контакт с едно докосване", "One-tap contact"), ("Работно време, обаждане и упътване с едно докосване, връзки към Instagram, TikTok и Facebook.", "Opening hours, tap-to-call and tap-for-directions, plus links to Instagram, TikTok and Facebook.")),
      (("Панел за собственика", "Owner panel"), ("Студиото само обновява бръснари, снимки, работно време и текстове — от компютър или телефон. Дизайнът остава заключен, а промените излизат на сайта за минута-две.", "The shop updates barbers, photos, opening hours and texts on its own — from a computer or a phone. The design stays locked, and changes go live in a minute or two.")),
      (("Наръчник за редактиране", "Editing guide"), ("Кратко илюстрирано ръководство, с което екипът работи с панела без обучение.", "A short illustrated guide so the team can use the panel without training.")),
    ]),
 "exclusive-barbershop": dict(
    name="Exclusive Barbershop", image="work-exclusive-barbershop.webp", url="https://exclusive-barbershop.com", service="barber",
    industry=("Барбершоп", "Barbershop"), location=("САЩ", "USA"),
    scope=("Сайт · Услуги и цени · Резервации", "Website · Services and pricing · Booking"),
    title=("Премиум присъствие за<br><em>модерен барбершоп.</em>", "A premium presence for a<br><em>modern barbershop.</em>"),
    lead=("Сайт за барбершоп в САЩ, който представя услугите с ясни цени и води клиента към резервация през Booksy или TheCut.",
          "A website for a barbershop in the USA that presents its services with clear pricing and takes the client to booking through Booksy or TheCut."),
    brief=("Exclusive Barbershop имаше нужда от сайт, който да изглежда на нивото на услугата — и да прави едно нещо добре: да превръща посетителя в записан час. Резервациите вече минаваха през Booksy и TheCut, затова сайтът трябваше да работи с тях, а не да ги замества.",
           "Exclusive Barbershop needed a website that looks as good as the service — and does one thing well: turn a visitor into a booked appointment. Bookings already ran through Booksy and TheCut, so the website had to work with them rather than replace them."),
    built=[
      (("Услуги и цени", "Services and pricing"), ("Пълно меню с над 13 услуги, подредени по категории — подстригване, брада и допълнителни услуги.", "A full menu of 13+ services grouped into haircuts, beard services and extras.")),
      (("Резервация с едно докосване", "One-tap booking"), ("Видими бутони към Booksy и TheCut във всяка секция.", "Visible buttons to Booksy and TheCut in every section.")),
      (("Галерия", "Gallery"), ("Снимки от салона и работата на екипа.", "Photos of the shop and the team’s work.")),
      (("Работно време и контакти", "Hours and contact"), ("Работно време по дни, адрес и връзка към Instagram.", "Opening hours by day, address and a link to Instagram.")),
      (("Мобилна версия", "Mobile first"), ("Проектиран първо за телефон, откъдето идват повечето резервации.", "Designed for the phone first, where most bookings come from.")),
    ]),
 "new-shade": dict(
    name="New Shade", image="work-new-shade.webp", image2="site-new-shade.webp", url="https://new-shade.com", service="shop",
    industry=("Външно засенчване · E-commerce", "Outdoor shading · E-commerce"), location=("България", "Bulgaria"),
    scope=("Онлайн магазин · Плащания · Вътрешна система", "Online store · Payments · Back-office system"),
    title=("Не просто сайт.<br><em>Цяла система за продажби.</em>", "More than a website.<br><em>A complete sales system.</em>"),
    lead=("New Shade е собствен проект на SONIK — марка за слънцезащитни ламели по поръчка. Зад сайта стои система, която поема поръчката от първия клик до доставката.",
          "New Shade is SONIK’s own venture — a brand for made-to-order sun-shading louvres. Behind the website runs a system that carries an order from the first click to delivery."),
    brief=("Продукт по размер не се продава като готова стока: клиентът избира материал, размери и механизъм, а след поръчката следват документи, производство и доставка. Целта беше сайтът да представи продукта убедително, а системата зад него да свърши рутинната работа.",
           "A made-to-measure product does not sell like stock: the client chooses material, dimensions and mechanism, and after the order come documents, production and delivery. The goal was a website that presents the product convincingly, and a system behind it that handles the routine work."),
    built=[
      (("Онлайн магазин и Stripe checkout", "Online store and Stripe checkout"), ("Продуктови страници за дървени и алуминиеви ламели и защитено плащане през Stripe.", "Product pages for wooden and aluminium louvres, with secure payment through Stripe.")),
      (("Виртуален офис", "Virtual office"), ("Едно място за поръчките и доставките, вместо таблици и имейли.", "One place for orders and deliveries instead of spreadsheets and emails.")),
      (("Автоматични документи", "Automated documents"), ("Фактури и фискални бонове се издават автоматично при поръчка.", "Invoices and fiscal receipts are issued automatically with every order.")),
      (("Собствена статистика", "First-party analytics"), ("Данни за посещенията и рекламните източници, без зависимост от външни инструменти.", "Visit and campaign-source data without depending on third-party tools.")),
      (("Представяне на продукта", "Product presentation"), ("Сравнение „преди и след“, обяснение на механизма и форма за запитване по проект.", "A before-and-after comparison, an explanation of the mechanism and a made-to-order enquiry form.")),
    ]),
 "woodra-a-frame": dict(
    name="Woodra A-Frame", image="work-woodra.webp", url="https://woodra-aframe.com", service="web",
    industry=("Къщи за гости", "Guest houses"), location=("Берковица, България", "Berkovitsa, Bulgaria"),
    scope=("Сайт · Галерия · Резервация", "Website · Gallery · Booking"),
    title=("Усещането за планина<br><em>започва от сайта.</em>", "The mountain escape<br><em>starts on the website.</em>"),
    lead=("Сайт за две A-Frame къщи край Берковица, който показва мястото като преживяване и води към резервация.",
          "A website for two A-frame houses near Berkovitsa that presents the place as an experience and leads to a booking."),
    brief=("Woodra не продава легла, а уикенд сред природата. Сайтът трябваше да предаде атмосферата със снимки и малко думи, да обясни ясно вариантите за престой и да улесни резервацията.",
           "Woodra does not sell beds; it sells a weekend in nature. The website had to carry the atmosphere with photographs and few words, explain the stay options clearly and make booking easy."),
    built=[
      (("Варианти за престой", "Stay options"), ("Целият комплекс или по-малка компания — с ясно описание какво включва всеки вариант.", "The whole complex or a smaller group — with a clear description of what each option includes.")),
      (("Удобства", "Amenities"), ("Сезонен отопляем басейн, джакузи, огнище и барбекю, панорамна тераса.", "Seasonal heated pool, jacuzzi, fire pit and barbecue, panoramic terrace.")),
      (("Галерия по преживявания", "Gallery by experience"), ("Снимките са подредени по теми — архитектура, интериор, двор, природа.", "Photographs are arranged by theme — architecture, interior, garden, nature.")),
      (("Околността", "The surroundings"), ("Какво има наоколо в Берковския Балкан.", "What to see nearby in the Berkovitsa mountains.")),
      (("Резервация и правила", "Booking and house rules"), ("Бутон за резервация във всяка секция и ясни правила за престоя.", "A booking button in every section and clear house rules.")),
    ]),
 "maison-dor": dict(
    name="MAISON D’OR", image="work-maison-dor.webp", url="https://sonikwebdesign.github.io/snhair/", service="shop",
    industry=("Красота · Каталог", "Beauty · Catalogue"), location=("България", "Bulgaria"),
    scope=("Сайт · Продуктов каталог · Запитвания", "Website · Product catalogue · Enquiries"),
    title=("Луксозна витрина за<br><em>премиум коса.</em>", "A luxury showcase for<br><em>premium hair.</em>"),
    lead=("Сайт за марка премиум славянска коса: клиентът избира цвят, грамаж и дължина и изпраща запитване.",
          "A website for a premium Slavic hair brand: the client chooses colour, weight and length and sends an enquiry."),
    brief=("Продуктът е скъп и личен, затова първото впечатление решава всичко. Сайтът трябваше да изглежда като моден бранд, а изборът на продукт да бъде прост.",
           "The product is expensive and personal, so the first impression decides everything. The website had to feel like a fashion brand while keeping product selection simple."),
    built=[
      (("Избор на продукт", "Product selection"), ("Кератинови кичури и треса на редове с избор на цвят, грамаж и дължина.", "Keratin strands and wefts with a choice of colour, weight and length.")),
      (("Директно запитване", "Direct enquiry"), ("Избраната комбинация се изпраща като запитване с едно докосване.", "The chosen combination is sent as an enquiry in one tap.")),
      (("Грижа за косата", "Hair care"), ("Отделна секция със съвети за поддръжка.", "A separate section with care advice.")),
      (("Луксозна визия", "Luxury look"), ("Тъмна палитра, злато и едра типография, които поставят продукта в центъра.", "A dark palette, gold and large typography that put the product at the centre.")),
    ]),
 "bulgara": dict(
    name="Българа", image="work-bulgara.webp", url="https://sonikwebdesign.github.io/ffbylgara/", service="web",
    industry=("Събития · Фолклор", "Events · Folklore"), location=("България", "Bulgaria"),
    scope=("Сайт · Галерия и видео · Запитвания", "Website · Gallery and video · Enquiries"),
    title=("Духът на България,<br><em>на една страница.</em>", "The spirit of Bulgaria,<br><em>on one page.</em>"),
    lead=("Сайт за фолклорна формация, която участва на сватби, корпоративни събития, фестивали и концерти.",
          "A website for a folklore ensemble that performs at weddings, corporate events, festivals and concerts."),
    brief=("Който търси формация за събитие, иска да види три неща: как изглежда на сцена, дали е свободна на датата и как да се свърже. Сайтът е подреден точно в този ред.",
           "Someone booking an ensemble for an event wants three things: to see it on stage, to know whether the date is free, and to get in touch. The website is arranged in exactly that order."),
    built=[
      (("Програми по повод", "Programmes by occasion"), ("Сватби, корпоративни събития, фестивали и празници.", "Weddings, corporate events, festivals and celebrations.")),
      (("Галерия и видео", "Gallery and video"), ("Моменти от сцената и видео от изпълнения.", "Moments from the stage and performance videos.")),
      (("Свободни дати", "Available dates"), ("Календар със свободните дати на формацията.", "A calendar of the ensemble’s available dates.")),
      (("Запитване за събитие", "Event enquiry"), ("Кратка форма с всичко необходимо за оферта.", "A short form with everything needed for a quote.")),
    ]),
 "olga-rusakova": dict(
    name="Olga Rusakova", image="work-olga-rusakova.webp", url="https://sonikwebdesign.github.io/cosmetolog_olga/", service="web",
    industry=("Естетична козметология", "Aesthetic cosmetology"), location=("Варна, България", "Varna, Bulgaria"),
    scope=("Личен бранд · Услуги · Записване", "Personal brand · Services · Booking"),
    title=("Личен бранд, изграден<br><em>върху доверие.</em>", "A personal brand<br><em>built on trust.</em>"),
    lead=("Сайт на руски език за козметолог-естетист във Варна — услуги, реални резултати и записване за консултация.",
          "A Russian-language website for an aesthetic cosmetologist in Varna — services, real results and consultation booking."),
    brief=("В козметологията клиентът избира човек, не кабинет. Сайтът трябваше да представи специалиста, квалификацията и резултатите спокойно и убедително, на езика на клиентите.",
           "In cosmetology the client chooses a person, not a clinic. The website had to present the specialist, her qualifications and her results calmly and convincingly, in her clients’ language."),
    built=[
      (("Представяне на специалиста", "The specialist"), ("Портрет, сертификати и подход към работата.", "A portrait, certifications and her approach to the work.")),
      (("Услуги", "Services"), ("Апаратна козметология, микронидлинг и anti-age програми, описани разбираемо.", "Device-based treatments, microneedling and anti-age programmes, explained plainly.")),
      (("Реални резултати", "Real results"), ("Секция с резултати от процедури.", "A section with treatment results.")),
      (("Записване за консултация", "Consultation booking"), ("Ясен бутон за записване във всяка част на страницата.", "A clear booking button in every part of the page.")),
    ]),
 "dani-cuts": dict(
    name="DANI CUTS", image="work-dani-cuts.webp", url="https://sonikwebdesign.github.io/barberD/", service="barber",
    industry=("Фризьорско студио", "Hair studio"), location=("Перник, България", "Pernik, Bulgaria"),
    scope=("Сайт · Онлайн записване", "Website · Online booking"),
    title=("Онлайн записване за<br><em>студио в Перник.</em>", "Online booking for a<br><em>studio in Pernik.</em>"),
    lead=("Сайт за фризьорско студио с избор на услуга и свободен час направо от страницата.",
          "A website for a hair studio where the client picks a service and a free slot right on the page."),
    brief=("Записването по телефон и в Instagram отнема време и на двете страни. Целта беше клиентът да си запази час сам, а студиото да вижда графика си в един календар.",
           "Booking by phone and Instagram costs both sides time. The goal was for clients to book on their own, and for the studio to see its schedule in a single calendar."),
    built=[
      (("Онлайн записване", "Online booking"), ("Избор на услуга и час през Cal.com, синхронизиран с Google Calendar.", "Service and time selection through Cal.com, synced with Google Calendar.")),
      (("Услуги", "Services"), ("Подстригване, оформяне, брада и контур, комбинирани пакети.", "Haircuts, styling, beard and contour, and combined packages.")),
      (("Локация", "Location"), ("Адрес и упътване до студиото.", "Address and directions to the studio.")),
      (("Тъмна, уверена визия", "A dark, confident look"), ("Визия, която отговаря на стила на студиото и на профила му в Instagram.", "A look that matches the studio’s style and its Instagram profile.")),
    ]),
}
PROJECT_SLUG = lambda key, lang: ("proekt-" if lang == "bg" else "case-study-") + key + ".html"

# ───────────────────────── services ─────────────────────────
SERVICES = {
 "barber": dict(
    slug=("sait-za-barbershop.html", "barbershop-website-design.html"),
    name=("Сайт за барбершоп", "Barbershop website design"),
    meta_title=("Сайт за барбершоп и фризьорски салон | SONIK Web Design", "Barbershop Website Design with Online Booking | SONIK"),
    meta_desc=("Изработка на сайт за барбершоп и салон: избор на бръснар, директна резервация през Booksy, TheCut или Cal.com, галерия и панел за собственика. Проекти в САЩ и България.",
               "Website design for barbershops and salons: barber profiles, direct booking through Booksy, TheCut or Square, galleries and an owner panel. Shops in the USA and Bulgaria."),
    eyebrow=("СПЕЦИАЛИЗАЦИЯ", "SPECIALISM"),
    title=("Сайтове за барбершопи,<br><em>създадени около резервацията.</em>", "Barbershop websites<br><em>built around booking.</em>"),
    lead=("Клиентът Ви намира в Instagram или Google и има една цел — да си запази час. Правим сайтове, които го водят дотам с едно докосване: при правилния бръснар, в платформата, която вече използвате.",
          "Your client finds you on Instagram or Google with one goal — to book a chair. We build websites that get them there in one tap: to the right barber, on the booking platform you already use."),
    price=("от 200 € за една страница · с панел за управление — по оферта", "Custom quote for every shop"),
    video="210-barber-studio",
    included=[
      (("Профил за всеки бръснар", "A profile for every barber"), ("Име, снимка, начална цена и личен линк за резервация.", "Name, photo, starting price and a personal booking link.")),
      (("Работа с Вашата платформа", "Works with your booking platform"), ("Booksy, TheCut, Square, Cal.com — свързваме сайта с това, което вече ползвате.", "Booksy, TheCut, Square, Cal.com — we connect the website to what you already use.")),
      (("Услуги и цени", "Services and pricing"), ("Ясно меню, подредено по категории.", "A clear menu grouped by category.")),
      (("Галерия с работата Ви", "A gallery of your work"), ("Прически, салон и награди, с преглед на цял екран.", "Cuts, the shop and awards, with full-screen view.")),
      (("Панел за собственика", "Owner panel"), ("Сами добавяте бръснари, снимки и работно време от телефона — без да чакате разработчик.", "Add barbers, photos and opening hours from your phone — without waiting for a developer.")),
      (("Първо телефон, после всичко останало", "Phone first"), ("Обаждане и упътване с едно докосване, бързо зареждане, основа за Google.", "Tap-to-call, tap-for-directions, fast loading and a solid foundation for Google.")),
    ],
    projects=["210-barber-studio", "exclusive-barbershop", "dani-cuts"],
    faq=[
      (("Работите ли с Booksy, TheCut и Square?", "Do you work with Booksy, TheCut and Square?"),
       ("Да. Сайтът води директно към профила за резервации на салона или на всеки бръснар поотделно. Не заменяме платформата, с която вече работите.", "Yes. The website links straight to the booking profile of the shop or of each individual barber. We do not replace the platform you already work with.")),
      (("Мога ли сам да сменям бръснари, снимки и работно време?", "Can I update barbers, photos and hours myself?"),
       ("Да. За сайтове с панел за собственика промените се правят от компютър или телефон и излизат на сайта за минута-две. Дизайнът остава заключен, така че нищо не може да се счупи.", "Yes. On websites with an owner panel you make changes from a computer or a phone and they go live in a minute or two. The design stays locked, so nothing can break.")),
      (("Работите ли със салони в САЩ?", "Do you work with shops in the United States?"),
       ("Да. Два от барбър проектите ни са в САЩ — 210 Barber Studio в Сан Антонио и Exclusive Barbershop. Работим дистанционно от София, на английски.", "Yes. Two of our barbershop projects are in the USA — 210 Barber Studio in San Antonio and Exclusive Barbershop. We work remotely from Sofia, in English.")),
      (("Колко струва и за колко време става?", "How much does it cost and how long does it take?"),
       ("Зависи от броя бръснари, секциите и дали искате панел за управление. Получавате писмена оферта с цена и срок, преди да започнем.", "It depends on the number of barbers, the sections and whether you want an owner panel. You receive a written quote with price and timeline before we start.")),
    ]),
 "web": dict(
    slug=("izrabotka-na-sait.html", "website-design.html"),
    name=("Изработка на сайт", "Website design"),
    meta_title=("Изработка на сайт от 200 € — лендинг и фирмен сайт | SONIK", "Website Design for Small Businesses | SONIK Web Design"),
    meta_desc=("Изработка на сайт за малък бизнес: лендинг страница от 200 €, фирмен сайт от 450 €. Индивидуален дизайн, мобилна версия, SEO основа и писмена оферта преди старта.",
               "Website design for small businesses: landing pages and multi-page company websites. Individual design, mobile first, SEO foundation and a written quote before work begins."),
    eyebrow=("УСЛУГА", "SERVICE"),
    title=("Изработка на сайт,<br><em>който работи за бизнеса Ви.</em>", "Website design<br><em>that works for your business.</em>"),
    lead=("Лендинг страница за една услуга или пълен фирмен сайт. Започваме от целта — какво трябва да направи посетителят — и градим дизайна около нея.",
          "A landing page for a single service or a full company website. We start from the goal — what the visitor should do — and build the design around it."),
    price=("Лендинг страница от 200 € · Фирмен сайт от 450 €", "Custom quote for every project"),
    included=[
      (("Индивидуален дизайн", "Individual design"), ("Визия според Вашия бранд, не готова тема с друго лого.", "A look shaped by your brand, not a ready-made theme with a different logo.")),
      (("Мобилна версия", "Mobile version"), ("Проектирана отделно за телефон и таблет, а не просто „свита“.", "Designed separately for phone and tablet, not merely shrunk.")),
      (("Ясна структура", "Clear structure"), ("Услуги, проекти и контакт, подредени така, че следващата стъпка да е очевидна.", "Services, work and contact arranged so the next step is obvious.")),
      (("SEO основа", "SEO foundation"), ("Заглавия, описания, структурирани данни и бързо зареждане във всеки проект.", "Titles, descriptions, structured data and fast loading in every project.")),
      (("Форма за запитване", "Enquiry form"), ("Запитванията идват директно на имейла Ви.", "Enquiries arrive straight in your inbox.")),
      (("Писмена оферта", "A written quote"), ("Обхват, цена и срок са уточнени, преди да започнем.", "Scope, price and timeline are agreed before we start.")),
    ],
    projects=["woodra-a-frame", "bulgara", "olga-rusakova"],
    faq=[
      (("Какво включва лендинг страницата?", "What does a landing page include?"),
       ("Една страница с до 5 секции, адаптация за телефон и таблет, базови SEO метаданни и бутони за контакт. Текстовете и снимките се предоставят от Вас.", "A single page with up to 5 sections, phone and tablet layouts, essential SEO metadata and contact buttons. You supply the copy and images.")),
      (("Включени ли са домейнът и хостингът?", "Are domain and hosting included?"),
       ("Не. Уточняваме ги отделно според нуждите на сайта, както и платените лицензи и абонаменти.", "No. We agree on them separately based on the website’s needs, together with any paid licences and subscriptions.")),
      (("Можете ли да обновите съществуващия ми сайт?", "Can you redesign my current website?"),
       ("Да. Изпратете линк и какво искате да подобрите; ще предложим подход за дизайна, структурата и мобилната версия.", "Yes. Send a link and what you want to improve; we will suggest an approach to the design, structure and mobile version.")),
    ]),
 "shop": dict(
    slug=("onlain-magazin.html", "online-store-development.html"),
    name=("Изработка на онлайн магазин", "Online store development"),
    meta_title=("Изработка на онлайн магазин от 900 € | SONIK Web Design", "Online Store Development with Stripe Checkout | SONIK"),
    meta_desc=("Изработка на онлайн магазин: каталог, количка, Stripe плащания, автоматични фактури и вътрешна система за поръчки. От 900 €, с писмена оферта.",
               "Online store development: catalogue, cart, Stripe checkout, automated invoices and a back-office system for orders. A written quote for every project."),
    eyebrow=("УСЛУГА", "SERVICE"),
    title=("Онлайн магазин и<br><em>системата зад него.</em>", "An online store and<br><em>the system behind it.</em>"),
    lead=("Магазинът не свършва с бутона „Купи“. Проектираме и продуктовото представяне, и това, което следва — плащане, документи, доставка и анализ.",
          "A store does not end at the “Buy” button. We design both the product experience and what follows — payment, documents, delivery and analytics."),
    price=("Онлайн магазин от 900 €", "Custom quote for every project"),
    included=[
      (("Каталог и категории", "Catalogue and categories"), ("Продуктови страници, филтри и навигация, съобразени с асортимента.", "Product pages, filters and navigation shaped around your range.")),
      (("Количка и поръчка", "Cart and checkout"), ("Кратък процес на поръчка, проектиран първо за телефон.", "A short checkout designed for the phone first.")),
      (("Плащания през Stripe", "Stripe payments"), ("Защитено плащане с карта; други методи — според нуждите.", "Secure card payments; other methods as needed.")),
      (("Автоматични документи", "Automated documents"), ("Фактури и фискални бонове при поръчка, където бизнесът го изисква.", "Invoices and fiscal receipts on order, where the business requires them.")),
      (("Вътрешна система", "Back-office system"), ("Поръчки и доставки на едно място, вместо таблици и имейли.", "Orders and deliveries in one place instead of spreadsheets and emails.")),
      (("Собствена статистика", "First-party analytics"), ("Виждате откъде идват поръчките и коя реклама работи.", "See where orders come from and which campaign works.")),
    ],
    projects=["new-shade", "maison-dor"],
    faq=[
      (("Какви плащания поддържате?", "Which payment methods do you support?"),
       ("Стандартно интегрираме Stripe за плащане с карта. Наложен платеж и други методи се уточняват в офертата.", "We integrate Stripe for card payments as standard. Other methods are agreed in the quote.")),
      (("Колко продукта може да има магазинът?", "How many products can the store have?"),
       ("Няма технически лимит. Броят продукти и интеграциите влияят на обхвата и се описват в офертата.", "There is no technical limit. The number of products and integrations affect the scope and are set out in the quote.")),
      (("Можете ли да автоматизирате фактурите и доставките?", "Can you automate invoices and deliveries?"),
       ("Да. За New Shade изградихме система, която издава документите автоматично и следи поръчките и доставките на едно място.", "Yes. For New Shade we built a system that issues documents automatically and tracks orders and deliveries in one place.")),
    ]),
 "seo": dict(
    slug=("seo-optimizacia.html", "seo-ai-search-visibility.html"),
    name=("SEO и AI видимост", "SEO & AI search visibility"),
    meta_title=("SEO оптимизация и видимост в AI търсачки | SONIK Web Design", "SEO & AI Search Visibility (ChatGPT, Gemini, Perplexity) | SONIK"),
    meta_desc=("SEO оптимизация и видимост в AI търсачки като ChatGPT, Gemini и Perplexity: технически одит, структурирани данни, llms.txt, Google Search Console и локално SEO.",
               "SEO and visibility in AI search such as ChatGPT, Gemini and Perplexity: technical audit, structured data, llms.txt, Google Search Console and local SEO."),
    eyebrow=("УСЛУГА", "SERVICE"),
    title=("SEO и видимост<br><em>в AI търсачките.</em>", "SEO and visibility<br><em>in AI search.</em>"),
    lead=("Хората вече търсят и в Google, и в ChatGPT. Подготвяме сайта Ви да бъде разбран и от двете — с чиста техническа основа, структурирани данни и ясно съдържание.",
          "People now search on Google and in ChatGPT alike. We prepare your website to be understood by both — with a clean technical foundation, structured data and clear content."),
    price=("Индивидуална оферта според сайта", "Custom quote based on your website"),
    included=[
      (("Технически SEO одит", "Technical SEO audit"), ("Проверка на заглавия, описания, canonical и hreflang, скорост и мобилна версия — и корекциите след нея.", "A review of titles, descriptions, canonical and hreflang tags, speed and mobile version — followed by the fixes.")),
      (("Структурирани данни", "Structured data"), ("Schema.org за бизнеса, услугите, цените и въпросите, за да Ви разбират търсачките.", "Schema.org for your business, services, pricing and FAQs, so search engines understand you.")),
      (("Достъп за AI роботи", "AI crawler access"), ("Настройка на robots.txt и llms.txt за ChatGPT, Claude, Perplexity и Gemini.", "robots.txt and llms.txt set up for ChatGPT, Claude, Perplexity and Gemini.")),
      (("Съдържание без JavaScript", "Content without JavaScript"), ("Повечето AI роботи не изпълняват JavaScript. Правим текста четим в самия HTML.", "Most AI crawlers do not run JavaScript. We make your text readable in the HTML itself.")),
      (("Search Console и Bing", "Search Console and Bing"), ("Потвърждаване на сайта, подаване на sitemap и следене какво се индексира.", "Site verification, sitemap submission and monitoring of what gets indexed.")),
      (("Локално SEO", "Local SEO"), ("Google Business Profile и последователни данни за бизнеса в мрежата.", "Google Business Profile and consistent business details across the web.")),
    ],
    projects=["210-barber-studio", "new-shade", "woodra-a-frame"],
    faq=[
      (("Гарантирате ли първо място в Google?", "Do you guarantee first place on Google?"),
       ("Не, и никой не може честно да го гарантира. Гарантираме ясен обхват и отчет за свършеното — работим по факторите, които определят позициите.", "No, and nobody can honestly guarantee it. We guarantee a clear scope and a report of the work done — we work on the factors that determine rankings.")),
      (("Каква е разликата между SEO и видимост в AI търсачки?", "What is the difference between SEO and AI search visibility?"),
       ("Класическото SEO помага страницата да се класира в Google. AI търсачките обобщават отговори и цитират източници; за тях са важни ясни факти, структурирани данни и достъп за роботите им.", "Classic SEO helps a page rank on Google. AI search tools summarise answers and cite sources; for them clear facts, structured data and crawler access matter most.")),
      (("Работите ли по сайтове, които не сте правили вие?", "Do you work on websites you did not build?"),
       ("Да. Започваме с одит и предлагаме конкретен списък с корекции.", "Yes. We start with an audit and propose a specific list of fixes.")),
      (("Кога се виждат резултати?", "When do results show?"),
       ("Техническите корекции се отразяват за седмици, а позициите се движат в рамките на няколко месеца. Зависи и от конкуренцията в нишата.", "Technical fixes are picked up within weeks, while rankings move over a few months. It also depends on the competition in your niche.")),
    ]),
}


def T(pair, lang):
    return pair[0] if lang == "bg" else pair[1]


def ui(key, lang):
    return T(UI[key], lang)


def icon(name):
    return (f'<span class="action-icon action-icon--{name}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
            f'<use href="#sonik-icon-{name}"/></svg></span>')


def shell(lang, slug, alt_slug, title, desc, image, body, schemas, sprite):
    home, url = HOME[lang], BASE + slug
    other = "en" if lang == "bg" else "bg"
    alts = {lang: url, other: BASE + alt_slug}
    nav = "".join(f'<a href="{home}#{anchor}"><span>{ui(key, lang)}</span></a>'
                  for key, anchor in (("work", "work"), ("services", "services"), ("pricing", "pricing"), ("process", "process")))
    current = ' aria-current="true"'
    lang_links = "".join(
        f'<a class="lang-link" href="{slug if l == lang else alt_slug}" hreflang="{l}"{current if l == lang else ""}>{l.upper()}</a>'
        + ('<span>/</span>' if l == "bg" else "") for l in LANGS)
    s_links = "".join(f'<a href="{T(s["slug"], lang)}"><span>{T(s["name"], lang)}</span></a>' for s in SERVICES.values())
    w_links = "".join(f'<a href="{PROJECT_SLUG(k, lang)}"><span>{p["name"]}</span></a>' for k, p in PROJECTS.items())
    ld = json.dumps({"@context": "https://schema.org", "@graph": schemas}, ensure_ascii=False).replace("</", "<\\/")
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="theme-color" content="#0d1013">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="bg" href="{alts["bg"]}">
<link rel="alternate" hreflang="en" href="{alts["en"]}">
<link rel="alternate" hreflang="x-default" href="{alts["en"]}">
<meta property="og:type" content="website"><meta property="og:locale" content="{"bg_BG" if lang == "bg" else "en_GB"}">
<meta property="og:site_name" content="SONIK Web Design">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}{image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="manrope-extrabold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v=flat-4">
<link rel="stylesheet" href="premium.css?v=flat-4">
<link rel="stylesheet" href="signature.css?v=flat-8">
<link rel="stylesheet" href="pages.css?v=1">
<script defer src="site-config.js?v=1"></script>
<script defer src="pages.js?v=1"></script>
<script type="application/ld+json">{ld}</script>
</head>
<body class="inner-page">
{sprite}
<a class="skip-link" href="#main">{"Към съдържанието" if lang == "bg" else "Skip to content"}</a>
<header class="site-header"><div class="container header-inner">
<a href="{home}" class="brand" aria-label="SONIK Web Design"><img class="brand-mark" src="sonik-monogram.svg" alt="" width="40" height="40"><span>sonik<span class="brand-period">.</span><small>WEB DESIGN STUDIO</small></span></a><nav class="desktop-nav" aria-label="Main">{nav}</nav>
<div class="header-actions"><div class="language" aria-label="Language">{lang_links}</div><a class="button button-small header-cta has-action-icon" href="{home}#contact"><span>{ui("cta", lang)}</span>{icon("conversation")}</a><button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu"><span></span><span></span></button></div>
</div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile" hidden>{nav}<a class="button has-action-icon" href="{home}#contact"><span>{ui("cta", lang)}</span>{icon("conversation")}</a></nav></header>
<main id="main" class="page-main">
{body}
<section class="page-section page-cta"><div class="container"><p class="eyebrow"><span>{ui("next", lang).upper()}</span></p><h2>{ui("next_h", lang)}</h2><p class="page-lead">{ui("next_p", lang)}</p>
<div class="page-actions"><a class="button has-action-icon" href="{home}#contact"><span>{ui("quote", lang)}</span>{icon("conversation")}</a><a class="text-link calendly-link" data-calendly hidden target="_blank" rel="noopener"><span>{ui("call", lang)}</span> <b aria-hidden="true">↗</b></a><a class="text-link" href="mailto:sonikwebco@gmail.com"><span>sonikwebco@gmail.com</span></a></div></div></section>
</main>
<footer class="container footer"><div class="footer-top"><a href="{home}" class="brand" aria-label="SONIK Web Design"><img class="brand-mark" src="sonik-monogram.svg" alt="" width="40" height="40"><span>sonik<span class="brand-period">.</span><small>WEB DESIGN STUDIO</small></span></a><p><span>{ui("tagline", lang)}</span></p><a href="#main" class="back-top"><span>{"Към началото" if lang == "bg" else "Back to top"}</span> ↑</a></div>
<nav class="footer-links" aria-label="Pages"><div><span class="footer-links-title">{ui("s_title", lang)}</span>{s_links}</div><div><span class="footer-links-title">{ui("w_title", lang)}</span>{w_links}</div></nav>
<div class="footer-bottom"><span>© <span id="year">2026</span> SONIK Web Design</span><span>{ui("made", lang)}</span></div></footer>
</body>
</html>
'''


def crumbs(lang, trail):
    items = [f'<a href="{HOME[lang]}">{ui("home", lang)}</a>'] + [
        f'<a href="{href}">{e(label)}</a>' if href else f'<span aria-current="page">{e(label)}</span>' for label, href in trail]
    return '<nav class="crumbs" aria-label="Breadcrumb">' + '<span aria-hidden="true">/</span>'.join(items) + '</nav>'


def crumb_schema(lang, trail, url):
    parts = [(ui("home", lang), HOME_URL[lang])] + [(label, BASE + href if href else url) for label, href in trail]
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": n, "name": name, "item": item} for n, (name, item) in enumerate(parts, 1)]}


def feature_list(items, lang):
    return '<ol class="feature-list">' + "".join(
        f'<li><strong>{n:02d}</strong><span><b>{T(title, lang)}</b>{T(text, lang)}</span></li>' for n, (title, text) in enumerate(items, 1)) + '</ol>'


def project_cards(keys, lang):
    out = []
    for key in keys:
        p = PROJECTS[key]
        href = PROJECT_SLUG(key, lang)
        out.append(
            f'<article class="work-card"><a class="work-image" href="{href}" aria-label="{e(p["name"])}"><img src="{p["image"]}" width="1440" height="900" alt="{e(p["name"])} — {e(T(p["industry"], lang))}" loading="lazy"></a>'
            f'<div class="work-info"><div><span class="micro">{e(T(p["industry"], lang)).upper()} · {e(T(p["location"], lang)).upper()}</span><h3><a href="{href}">{p["name"]}</a></h3>'
            f'<p>{T(p["lead"], lang)}</p><a class="project-case-link" href="{href}"><span>{ui("case", lang)}</span><b aria-hidden="true">→</b></a></div></div></article>')
    return '<div class="card-grid">' + "".join(out) + '</div>'


def video_block(key, lang):
    src, poster = PROJECTS[key]["video"]
    name = PROJECTS[key]["name"]
    return (f'<figure class="page-media page-video"><video controls playsinline preload="none" poster="{poster}" width="1280" height="732" aria-label="{e(name)}">'
            f'<source src="{src}" type="video/mp4"></video><figcaption>{name} — {ui("watch", lang).lower()}</figcaption></figure>')


def case_page(key, lang, sprite):
    p = PROJECTS[key]
    slug, alt = PROJECT_SLUG(key, lang), PROJECT_SLUG(key, "en" if lang == "bg" else "bg")
    service = SERVICES[p["service"]]
    title = f'{p["name"]} — {T(p["industry"], lang)} | SONIK Web Design'
    desc = T(p["lead"], lang)
    others = [k for k in PROJECTS if k != key and PROJECTS[k]["service"] == p["service"]][:3]
    others += [k for k in PROJECTS if k != key and k not in others][: 3 - len(others)]
    media = video_block(key, lang) if p.get("video") else (
        f'<figure class="page-media"><img src="{p["image"]}" width="1600" height="1000" alt="{e(p["name"])} — {e(T(p["scope"], lang))}"></figure>')
    extra = (f'<figure class="page-media page-media--second"><img src="{p["image2"]}" width="1440" height="900" alt="{e(p["name"])} — {e(T(p["industry"], lang))}" loading="lazy"></figure>'
             if p.get("image2") else "")
    if p.get("video"):
        extra = f'<figure class="page-media page-media--second"><img src="{p["image"]}" width="1440" height="900" alt="{e(p["name"])} — {e(T(p["industry"], lang))}" loading="lazy"></figure>'
    body = f'''<section class="page-hero container">{crumbs(lang, [(ui("work", lang), HOME[lang] + "#work"), (p["name"], None)])}
<p class="eyebrow"><span>CASE STUDY · {e(p["name"]).upper()}</span></p><h1>{T(p["title"], lang)}</h1><p class="page-lead">{T(p["lead"], lang)}</p>
<div class="page-actions"><a class="button has-action-icon" href="{p["url"]}" target="_blank" rel="noopener"><span>{ui("live", lang)}</span><b aria-hidden="true">↗</b></a><a class="text-link" href="{HOME[lang]}#contact"><span>{ui("quote", lang)}</span></a></div>
<dl class="page-facts"><div><dt>{ui("industry", lang)}</dt><dd>{T(p["industry"], lang)}</dd></div><div><dt>{ui("location", lang)}</dt><dd>{T(p["location"], lang)}</dd></div><div><dt>{ui("scope", lang)}</dt><dd>{T(p["scope"], lang)}</dd></div></dl>
{media}</section>
<section class="page-section"><div class="container split"><div><h2>{ui("brief", lang)}</h2></div><div class="prose"><p>{T(p["brief"], lang)}</p></div></div></section>
<section class="page-section"><div class="container split"><div><h2>{ui("built", lang)}</h2>
<p class="page-note">{ui("related_service", lang)}: <a href="{T(service["slug"], lang)}">{T(service["name"], lang)} →</a></p></div><div>{feature_list(p["built"], lang)}</div></div>{('<div class="container">' + extra + '</div>') if extra else ""}</section>
<section class="page-section"><div class="container"><div class="section-heading"><div><h2>{ui("more_work", lang)}</h2></div><a class="text-link" href="{HOME[lang]}#work"><span>{ui("all_work", lang)} →</span></a></div>{project_cards(others, lang)}</div></section>'''
    trail = [(ui("work", lang), None), (p["name"], None)]
    url = BASE + slug
    schemas = [
        {"@type": "CreativeWork", "@id": url + "#work", "name": p["name"], "headline": re.sub(r"<[^>]+>", " ", T(p["title"], lang)).strip(),
         "description": desc, "url": p["url"], "mainEntityOfPage": url, "image": BASE + p["image"], "inLanguage": lang,
         "about": T(p["industry"], lang), "locationCreated": T(p["location"], lang), "creator": {"@id": BASE + "#org"}},
        {"@type": "Organization", "@id": BASE + "#org", "name": "SONIK Web Design", "url": BASE},
        crumb_schema(lang, [(p["name"], None)], url),
    ]
    if p.get("video"):
        schemas.append({"@type": "VideoObject", "name": f'{p["name"]} — website walkthrough', "description": desc,
                        "thumbnailUrl": BASE + p["video"][1], "contentUrl": BASE + p["video"][0], "uploadDate": TODAY})
    return slug, alt, shell(lang, slug, alt, title, desc, p["image"], body, schemas, sprite)


def service_page(key, lang, sprite):
    s = SERVICES[key]
    slug, alt = T(s["slug"], lang), T(s["slug"], "en" if lang == "bg" else "bg")
    url = BASE + slug
    faq_html = '<div class="faq-list">' + "".join(
        f'<details><summary><span>{T(q, lang)}</span><span class="faq-plus" aria-hidden="true">+</span></summary><p>{T(a, lang)}</p></details>' for q, a in s["faq"]) + '</div>'
    video = (f'<section class="page-section"><div class="container"><div class="section-heading"><div><p class="eyebrow"><span>210 BARBER STUDIO · SAN ANTONIO</span></p><h2>{ui("watch", lang)}</h2></div>'
             f'<a class="text-link" href="{PROJECT_SLUG(s["video"], lang)}"><span>{ui("case", lang)} →</span></a></div>{video_block(s["video"], lang)}</div></section>') if s.get("video") else ""
    body = f'''<section class="page-hero container">{crumbs(lang, [(ui("services", lang), HOME[lang] + "#services"), (T(s["name"], lang), None)])}
<p class="eyebrow"><span>{T(s["eyebrow"], lang)}</span></p><h1>{T(s["title"], lang)}</h1><p class="page-lead">{T(s["lead"], lang)}</p>
<div class="page-actions"><a class="button has-action-icon" href="{HOME[lang]}#contact"><span>{ui("quote", lang)}</span>{icon("conversation")}</a><a class="text-link calendly-link" data-calendly hidden target="_blank" rel="noopener"><span>{ui("call", lang)}</span> <b aria-hidden="true">↗</b></a></div>
<p class="page-price">{T(s["price"], lang)}</p></section>
{video}
<section class="page-section"><div class="container split"><div><h2>{ui("included", lang)}</h2></div><div>{feature_list(s["included"], lang)}</div></div></section>
<section class="page-section"><div class="container"><div class="section-heading"><div><h2>{ui("projects", lang)}</h2></div><a class="text-link" href="{HOME[lang]}#work"><span>{ui("all_work", lang)} →</span></a></div>{project_cards(s["projects"], lang)}</div></section>
<section class="page-section"><div class="container split"><div><h2>{ui("faq", lang)}</h2></div>{faq_html}</div></section>'''
    schemas = [
        {"@type": "Service", "@id": url + "#service", "name": T(s["name"], lang), "serviceType": T(s["name"], lang), "description": T(s["meta_desc"], lang),
         "url": url, "inLanguage": lang, "areaServed": ["BG", "GB", "US"], "provider": {"@id": BASE + "#org"}},
        {"@type": "ProfessionalService", "@id": BASE + "#org", "name": "SONIK Web Design", "url": BASE, "email": "sonikwebco@gmail.com",
         "address": {"@type": "PostalAddress", "addressLocality": "Sofia", "addressCountry": "BG"}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": T(q, lang), "acceptedAnswer": {"@type": "Answer", "text": T(a, lang)}} for q, a in s["faq"]]},
        crumb_schema(lang, [(T(s["name"], lang), None)], url),
    ]
    return slug, alt, shell(lang, slug, alt, T(s["meta_title"], lang), T(s["meta_desc"], lang), "social-preview.png", body, schemas, sprite)


def main():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    sprite = re.search(r'<svg class="sonik-symbols".*?</svg>', index, flags=re.S).group(0)
    pairs = [(BASE, BASE + "en.html")]
    written = 0
    for key in SERVICES:
        made = {lang: service_page(key, lang, sprite) for lang in LANGS}
        pairs.append((BASE + made["bg"][0], BASE + made["en"][0]))
        for slug, _, text in made.values():
            (ROOT / slug).write_text(text, encoding="utf-8"); written += 1
    for key in PROJECTS:
        made = {lang: case_page(key, lang, sprite) for lang in LANGS}
        pairs.append((BASE + made["bg"][0], BASE + made["en"][0]))
        for slug, _, text in made.values():
            (ROOT / slug).write_text(text, encoding="utf-8"); written += 1
    urls = []
    for bg, en in pairs:
        for loc in (bg, en):
            urls.append(f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{TODAY}</lastmod>\n'
                        f'    <xhtml:link rel="alternate" hreflang="bg" href="{bg}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>\n'
                        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>\n  </url>')
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
                                      'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(urls) + "\n</urlset>\n", encoding="utf-8")
    print(f"{written} pages written, sitemap.xml lists {len(urls)} URLs")


if __name__ == "__main__":
    main()
