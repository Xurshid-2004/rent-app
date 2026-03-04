export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    back: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    confirmAgain: string;
    deleted: string;
    cancelled: string;
    loggedOut: string;
    logoutError: string;
  };
  nav: {
    all: string;
    family: string;
    comfort: string;
    sport: string;
    classic: string;
    categories: string;
    addCar: string;
    chooseDay: string;
    login: string;
    signup: string;
    profile: string;
    admin: string;
    contact: string;
  };
  car: {
    name: string;
    year: string;
    category: string;
    price: string;
    perDay: string;
    available: string;
    notAvailable: string;
    quantity: string;
    description: string;
    images: string;
    addToRent: string;
    rentCar: string;
    details: string;
    rating: string;
    reviews: string;
  };
  addCar: {
    title: string;
    carName: string;
    carNamePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    price: string;
    pricePlaceholder: string;
    category: string;
    images: string;
    uploadImages: string;
    submit: string;
    success: string;
    error: string;
    required: string;
  };
  profile: {
    title: string;
    myCars: string;
    myOrders: string;
    myRentalCars: string;
    noCars: string;
    noOrders: string;
    noRentalCars: string;
    addFirstCar: string;
    carInfo: string;
    orderInfo: string;
    status: string;
    pending: string;
    confirmed: string;
    cancelled: string;
    cancelOrder: string;
    rejectRental: string;
    deleteCar: string;
    editCar: string;
    dataLoadError: string;
    carUpdated: string;
    carUpdateError: string;
    carDeleted: string;
    carDeleteError: string;
    orderCancelled: string;
    orderCancelError: string;
  };
  order: {
    title: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    startDate: string;
    endDate: string;
    submit: string;
    selectDates: string;
    selectedDates: string;
    overlap: string;
    success: string;
    error: string;
  };
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone: string;
    alreadyHave: string;
    dontHave: string;
    loginSuccess: string;
    signupSuccess: string;
    loginError: string;
    signupError: string;
    pleaseLogin: string;
  };
  admin: {
    title: string;
    codeRequired: string;
    invalidCode: string;
    cars: string;
    orders: string;
    users: string;
    addCar: string;
    editCar: string;
    deleteCar: string;
    carAdded: string;
    carUpdated: string;
    carDeleted: string;
    nameRequired: string;
    yearRequired: string;
    imageRequired: string;
    imageTypeError: string;
    qtyIncreased: string;
    saved: string;
    deleted: string;
    retryError: string;
    myCars: string;
    noCars: string;
    returnToSales: string;
    confirmReturn: string;
    returnSuccess: string;
    returnError: string;
    deleteOrderConfirm: string;
    orderDeleted: string;
    orderDeleteError: string;
    image: string;
    carName: string;
    carNamePlaceholder: string;
    year: string;
    yearPlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    price: string;
    pricePlaceholder: string;
    category: string;
    saving: string;
    editTitle: string;
    cancel: string;
    pricePerDay: string;
    available: string;
    customerName: string;
    customerPhone: string;
    customerBought: string;
    dates: string;
  };
  contact: {
    title: string;
    phone: string;
    instagram: string;
    telegram: string;
  };
  landing: {
    premiumFeel: string;
    bestService: string;
    orderNow: string;
    getInMinutes: string;
    discoverWorld: string;
    carRental: string;
    drivingCar: string;
    getIn15Minutes: string;
    orderNowBtn: string;
    aboutRental: string;
    allCars: string;
    exclusiveCollection: string;
    premiumCatalog: string;
    affordable: string;
    transparent: string;
    idealCondition: string;
    delivery: string;
    fastDocuments: string;
    contacts: string;
    phoneNumber: string;
    address: string;
    needWebsite: string;
    connectWithUs: string;
    whyChooseUs: string;
    drivingCarBrand: string;
    partnershipBenefits: string;
    largeParking: string;
    parkingDesc: string;
    cleanCars: string;
    cleanCarsDesc: string;
    comfortClass: string;
    comfortClassDesc: string;
    technicalIdeal: string;
    technicalIdealDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  uz: {
    common: {
      loading: "Yuklanmoqda...",
      error: "Xatolik",
      success: "Muvaffaqiyatli",
      back: "Orqaga",
      save: "Saqlash",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      edit: "Tahrirlash",
      close: "Yopish",
      confirm: "Tasdiqlash",
      yes: "Ha",
      no: "Yo'q",
      confirmAgain: "Tasdiqlash uchun 3 soniya ichida yana bir marta bosing.",
      deleted: "O‘chirildi.",
      cancelled: "Bekor qilindi.",
      loggedOut: "Chiqildi.",
      logoutError: "Chiqishda xatolik"
    },
    nav: {
      all: "Barchasi",
      family: "Oilaviy",
      comfort: "Komfort",
      sport: "Sport",
      classic: "Klassik",
      categories: "Category",
      addCar: "O'z mashinasini qo'shish",
      chooseDay: "Kunni tanlash",
      login: "Kirish",
      signup: "Ro'yxatdan o'tish",
      profile: "Profil",
      admin: "Admin",
      contact: "Kontakt"
    },
    car: {
      name: "Mashina nomi",
      year: "Yil",
      category: "Kategoriya",
      price: "Narx",
      perDay: "kuniga",
      available: "Mavjud",
      notAvailable: "Mavjud emas",
      quantity: "Miqdor",
      description: "Tavsif",
      images: "Rasmlar",
      addToRent: "Ijaraga qo'shish",
      rentCar: "Ijaraga olish",
      details: "Batafsil ma'lumot",
      rating: "Reyting",
      reviews: "Sharhlar"
    },
    addCar: {
      title: "O'z mashinasini qo'shish",
      carName: "Mashina nomi",
      carNamePlaceholder: "Mashina nomini kiriting...",
      description: "Tavsif",
      descriptionPlaceholder: "Mashina haqida qisqacha ma'lumot...",
      price: "Narx (so'm)",
      pricePlaceholder: "Narxni kiriting...",
      category: "Kategoriya",
      images: "Rasmlar",
      uploadImages: "Rasmlarni yuklash",
      submit: "Qo'shish",
      success: "Mashina muvaffaqiyatli qo'shildi!",
      error: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
      required: "Bu maydon to'ldirilishi shart"
    },
    profile: {
      title: "Profil",
      myCars: "Mening mashinalarim",
      myOrders: "Mening buyurtmalarim",
      myRentalCars: "Sizni ijaraga berilgan mashinalaringiz",
      noCars: "Siz hali mashina qo'shmadingiz",
      noOrders: "Sizda hali buyurtmalar yo'q",
      noRentalCars: "Hali ijaraga berilgan mashinalar yo'q",
      addFirstCar: "Birinchi mashinani qo'shish",
      carInfo: "Mashina ma'lumotlari",
      orderInfo: "Buyurtma ma'lumotlari",
      status: "Holati",
      pending: "Kutilmoqda",
      confirmed: "Tasdiqlangan",
      cancelled: "Bekor qilingan",
      cancelOrder: "Bekor qilish",
      rejectRental: "Rad etish",
      deleteCar: "O'chirish",
      editCar: "Tahrir",
      dataLoadError: "Ma'lumotlarni yuklashda xatolik",
      carUpdated: "Mashina ma'lumotlari yangilandi!",
      carUpdateError: "Mashinani yangilashda xatolik",
      carDeleted: "Mashina o‘chirildi!",
      carDeleteError: "Mashinani o‘chirishda xatolik",
      orderCancelled: "Buyurtma bekor qilindi!",
      orderCancelError: "Buyurtmani bekor qilishda xatolik"
    },
    order: {
      title: "Ijaraga olish",
      customerName: "Ismingiz",
      customerPhone: "Telefon",
      customerEmail: "Email",
      startDate: "Boshlanish sanasi",
      endDate: "Tugash sanasi",
      submit: "Buyurtma qilish",
      selectDates: "Avval navbardagi «Kunni tanlash» orqali sanalarni tanlang.",
      selectedDates: "Tanlangan sana",
      overlap: "Bundan oldin shu mashina shu sanalarda buyurtma qilingan.",
      success: "Buyurtma qabul qilindi.",
      error: "Xato yuz berdi."
    },
    auth: {
      login: "Kirish",
      signup: "Ro'yxatdan o'tish",
      email: "Email",
      password: "Parol",
      confirmPassword: "Parolni tasdiqlang",
      fullName: "To'liq ism",
      phone: "Telefon",
      alreadyHave: "Akkauntingiz bormi?",
      dontHave: "Akkauntingiz yo'qmi?",
      loginSuccess: "Muvaffaqiyatli kirdingiz!",
      signupSuccess: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      loginError: "Login xatoligi",
      signupError: "Ro'yxatdan o'tish xatoligi",
      pleaseLogin: "Iltimos, avval ro'yxatdan o'ting!"
    },
    admin: {
      title: "Admin panel",
      codeRequired: "Admin kodi talab qilinadi",
      invalidCode: "Noto'g'ri kod",
      cars: "Mashinalar",
      orders: "Buyurtmalar",
      users: "Foydalanuvchilar",
      addCar: "Mashina qo'shish",
      editCar: "Tahrirlash",
      deleteCar: "O'chirish",
      carAdded: "Mashina qo'shildi",
      carUpdated: "Mashina yangilandi",
      carDeleted: "Mashina o'chirildi",
      nameRequired: "Mashina nomini kiriting.",
      yearRequired: "Ishlab chiqarilgan yilini kiriting.",
      imageRequired: "Rasm tanlang (galereyadan).",
      imageTypeError: "Faqat rasm fayllari (jpg, png, webp) qabul qilinadi.",
      qtyIncreased: "Bir xil nomdagi mashina soni 1 ta oshirildi.",
      saved: "Saqlandi.",
      deleted: "O‘chirildi.",
      retryError: "Xato yuz berdi. Qaytadan urinib ko‘ring.",
      myCars: "Mening mashinalarim",
      noCars: "Hali mashina qo'shilmagan.",
      returnToSales: "Sotuvga qaytarish",
      confirmReturn: "Mashinani sotuvga qaytarishni tasdiqlang",
      returnSuccess: "Mashina sotuvga muvaffaqiyatli qaytarildi!",
      returnError: "Xatolik yuz berdi",
      deleteOrderConfirm: "Buyurtmani o'chirishni tasdiqlang",
      orderDeleted: "Buyurtma muvaffaqiyatli o'chirildi!",
      orderDeleteError: "Xatolik yuz berdi",
      image: "Rasm (galereyadan)",
      carName: "Mashina nomi",
      carNamePlaceholder: "Masalan: Chevrolet Malibu",
      year: "Ishlab chiqarilgan yili",
      yearPlaceholder: "Masalan: 2023",
      description: "Mashina haqida",
      descriptionPlaceholder: "Masalan: Ikkita xonali sedan, avtomat uzatma, konditsioner, kamera",
      price: "Narx (Kuniga qancha)",
      pricePlaceholder: "Masalan: 200 ming",
      category: "Kategoriya",
      saving: "Saqlanmoqda...",
      editTitle: "Mashinani tahrirlash",
      cancel: "Bekor qilish",
      pricePerDay: "so'm / kun",
      available: "Mavjud: {count} ta",
      customerName: "ismli mijoz",
      customerPhone: "Tel: {phone}",
      customerBought: "rusumdagi mashinani xarid qildi.",
      dates: "{start} — {end}"
    },
    contact: {
      title: "Aloqa",
      phone: "Telefon",
      instagram: "Instagram",
      telegram: "Telegram"
    },
    landing: {
      premiumFeel: "O'zingizni premium avtomobil egasidek his eting!",
      bestService: "Eng yaxshi avtomobil ijarasi xizmati!",
      orderNow: "Hoziroq mashinaga buyurtma bering va mashinani 15 daqiqada olib keting!",
      getInMinutes: "Hoziroq mashinaga buyurtma bering va mashinani 15 daqiqada olib keting!",
      discoverWorld: "DUNYONI KASHF ETING",
      carRental: "Avto ijara ",
      drivingCar: "drivingCar",
      getIn15Minutes: "15 daqiqada",
      orderNowBtn: "Buyurtma qilish >",
      aboutRental: "Mashina ijaraga olish drivingCar haqida",
      allCars: "Barcha mashinalar",
      exclusiveCollection: "Eksklyuziv to'plami",
      premiumCatalog: "Premium Catalog",
      affordable: "Sug'urta narxning ichida",
      transparent: "Maksimal shaffof xizmat",
      idealCondition: "Ideal texnik holat",
      delivery: "Sizga qulay joyga boradi",
      fastDocuments: "Hujjatlar 15 daqiqada tayyor",
      contacts: "Kontaktlar",
      phoneNumber: "Telefon raqam",
      address: "Manzil:",
      needWebsite: "Sizga ham shunday sayt kerakmi? Unda biz bilan bog'laning",
      connectWithUs: "Telegram",
      whyChooseUs: "Nima uchun mijozlar",
      drivingCarBrand: "«DRIVING CAR»",
      partnershipBenefits: "Biz bilan hamkorlik qilib, siz eng yuqori darajadagi imtiyozlar va xizmat sifatiga ega bo'lasiz.",
      largeParking: "Katta avtoturargoh",
      parkingDesc: "Har qanday ta'mga mos",
      cleanCars: "Toza mashinalar",
      cleanCarsDesc: "Ideal poklik kafolati",
      comfortClass: "Comfort klass",
      comfortClassDesc: "Premium darajadagi qulaylik",
      technicalIdeal: "Texnik Ideal",
      technicalIdealDesc: "To'liq nazoratdan o'tgan"
    }
  },
  ru: {
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      back: "Назад",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      close: "Закрыть",
      confirm: "Подтвердить",
      yes: "Да",
      no: "Нет",
      confirmAgain: "Нажмите ещё раз в течение 3 секунд, чтобы подтвердить.",
      deleted: "Удалено.",
      cancelled: "Отменено.",
      loggedOut: "Вы вышли.",
      logoutError: "Ошибка выхода"
    },
    nav: {
      all: "Все",
      family: "Семейные",
      comfort: "Комфорт",
      sport: "Спорт",
      classic: "Классические",
      categories: "Категории",
      addCar: "Добавить свой автомобиль",
      chooseDay: "Выбрать день",
      login: "Войти",
      signup: "Регистрация",
      profile: "Профиль",
      admin: "Админ",
      contact: "Контакт"
    },
    car: {
      name: "Название автомобиля",
      year: "Год",
      category: "Категория",
      price: "Цена",
      perDay: "в день",
      available: "Доступен",
      notAvailable: "Недоступен",
      quantity: "Количество",
      description: "Описание",
      images: "Изображения",
      addToRent: "Добавить в аренду",
      rentCar: "Арендовать",
      details: "Подробнее",
      rating: "Рейтинг",
      reviews: "Отзывы"
    },
    addCar: {
      title: "Добавить свой автомобиль",
      carName: "Название автомобиля",
      carNamePlaceholder: "Введите название автомобиля...",
      description: "Описание",
      descriptionPlaceholder: "Краткая информация об автомобиле...",
      price: "Цена (сум)",
      pricePlaceholder: "Введите цену...",
      category: "Категория",
      images: "Изображения",
      uploadImages: "Загрузить изображения",
      submit: "Добавить",
      success: "Автомобиль успешно добавлен!",
      error: "Произошла ошибка. Попробуйте еще раз.",
      required: "Это поле обязательно для заполнения"
    },
    profile: {
      title: "Профиль",
      myCars: "Мои автомобили",
      myOrders: "Мои заказы",
      myRentalCars: "Ваши автомобили, сданные в аренду",
      noCars: "Вы еще не добавили автомобили",
      noOrders: "У вас пока нет заказов",
      noRentalCars: "Пока нет автомобилей в аренде",
      addFirstCar: "Добавить первый автомобиль",
      carInfo: "Информация об автомобиле",
      orderInfo: "Информация о заказе",
      status: "Статус",
      pending: "Ожидание",
      confirmed: "Подтвержден",
      cancelled: "Отменен",
      cancelOrder: "Отменить",
      rejectRental: "Отклонить",
      deleteCar: "Удалить",
      editCar: "Редактировать",
      dataLoadError: "Ошибка загрузки данных",
      carUpdated: "Данные автомобиля обновлены!",
      carUpdateError: "Ошибка обновления автомобиля",
      carDeleted: "Автомобиль удален!",
      carDeleteError: "Ошибка удаления автомобиля",
      orderCancelled: "Заказ отменен!",
      orderCancelError: "Ошибка отмены заказа"
    },
    order: {
      title: "Аренда",
      customerName: "Ваше имя",
      customerPhone: "Телефон",
      customerEmail: "Email",
      startDate: "Дата начала",
      endDate: "Дата окончания",
      submit: "Заказать",
      selectDates: "Сначала выберите даты в навбаре «Выбрать день».",
      selectedDates: "Выбранная дата",
      overlap: "Этот автомобиль уже забронирован на эти даты.",
      success: "Заказ принят.",
      error: "Произошла ошибка."
    },
    auth: {
      login: "Войти",
      signup: "Регистрация",
      email: "Email",
      password: "Пароль",
      confirmPassword: "Подтвердите пароль",
      fullName: "Полное имя",
      phone: "Телефон",
      alreadyHave: "У вас уже есть аккаунт?",
      dontHave: "У вас нет аккаунта?",
      loginSuccess: "Успешный вход!",
      signupSuccess: "Успешная регистрация!",
      loginError: "Ошибка входа",
      signupError: "Ошибка регистрации",
      pleaseLogin: "Пожалуйста, войдите в систему!"
    },
    admin: {
      title: "Админ панель",
      codeRequired: "Требуется код администратора",
      invalidCode: "Неверный код",
      cars: "Автомобили",
      orders: "Заказы",
      users: "Пользователи",
      addCar: "Добавить автомобиль",
      editCar: "Редактировать",
      deleteCar: "Удалить",
      carAdded: "Автомобиль добавлен",
      carUpdated: "Автомобиль обновлен",
      carDeleted: "Автомобиль удален",
      nameRequired: "Введите название автомобиля.",
      yearRequired: "Введите год выпуска.",
      imageRequired: "Выберите изображение (из галереи).",
      imageTypeError: "Разрешены только изображения (jpg, png, webp).",
      qtyIncreased: "Количество автомобиля с таким названием увеличено на 1.",
      saved: "Сохранено.",
      deleted: "Удалено.",
      retryError: "Произошла ошибка. Попробуйте снова.",
      myCars: "Мои автомобили",
      noCars: "Еще не добавлены автомобили.",
      returnToSales: "Вернуть в продажи",
      confirmReturn: "Подтвердите возврат автомобиля в продажи",
      returnSuccess: "Автомобиль успешно возвращен в продажи!",
      returnError: "Произошла ошибка",
      deleteOrderConfirm: "Подтвердите удаление заказа",
      orderDeleted: "Заказ успешно удален!",
      orderDeleteError: "Произошла ошибка",
      image: "Изображение (из галереи)",
      carName: "Название автомобиля",
      carNamePlaceholder: "Например: Chevrolet Malibu",
      year: "Год выпуска",
      yearPlaceholder: "Например: 2023",
      description: "Описание автомобиля",
      descriptionPlaceholder: "Например: Двухдверный седан, автоматическая коробка передач, кондиционер, камера",
      price: "Цена (в день)",
      pricePlaceholder: "Например: 200 тысяч",
      category: "Категория",
      saving: "Сохранение...",
      editTitle: "Редактировать автомобиль",
      cancel: "Отмена",
      pricePerDay: "сум / день",
      available: "Доступно: {count} шт.",
      customerName: "клиент",
      customerPhone: "Тел: {phone}",
      customerBought: "купил автомобиль марки.",
      dates: "{start} — {end}"
    },
    contact: {
      title: "Связь",
      phone: "Телефон",
      instagram: "Инстаграм",
      telegram: "Телеграм"
    },
    landing: {
      premiumFeel: "Почувствуйте себя как владелец премиум автомобиля!",
      bestService: "Лучший сервис аренды автомобилей!",
      orderNow: "Закажите автомобиль прямо сейчас и получите его через 15 минут!",
      getInMinutes: "Закажите автомобиль прямо сейчас и получите его через 15 минут!",
      discoverWorld: "ОТКРОЙТЕ МИР",
      carRental: "Аренда автомобилей",
      drivingCar: "drivingCar",
      getIn15Minutes: "15 минут",
      orderNowBtn: "Заказать >",
      aboutRental: "Аренда автомобилей drivingCar о",
      allCars: "Все автомобили",
      exclusiveCollection: "Эксклюзивная коллекция",
      premiumCatalog: "Premium Catalog",
      affordable: "В пределах доступной цены",
      transparent: "Максимальная прозрачность сервиса",
      idealCondition: "Идеальное техническое состояние",
      delivery: "Доставка в удобное для вас место",
      fastDocuments: "Документы готовы за 15 минут",
      contacts: "Контакты",
      phoneNumber: "Номер телефона",
      address: "Адрес:",
      needWebsite: "Нужен ли вам такой сайт? Тогда свяжитесь с нами",
      connectWithUs: "Telegram",
      whyChooseUs: "Почему клиенты",
      drivingCarBrand: "«DRIVING CAR»",
      partnershipBenefits: "Сотрудничая с нами, вы получите высочайшие привилегии и качество обслуживания.",
      largeParking: "Большая автостоянка",
      parkingDesc: "Подходит для любого вкуса",
      cleanCars: "Чистые автомобили",
      cleanCarsDesc: "Гарантия идеальной чистоты",
      comfortClass: "Комфорт класс",
      comfortClassDesc: "Премиум комфорт",
      technicalIdeal: "Технический идеал",
      technicalIdealDesc: "Полностью проверено"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      confirmAgain: "Click again within 3 seconds to confirm.",
      deleted: "Deleted.",
      cancelled: "Cancelled.",
      loggedOut: "Signed out.",
      logoutError: "Sign out error"
    },
    nav: {
      all: "All",
      family: "Family",
      comfort: "Comfort",
      sport: "Sport",
      classic: "Classic",
      categories: "Categories",
      addCar: "Add My Car",
      chooseDay: "Choose Day",
      login: "Login",
      signup: "Sign Up",
      profile: "Profile",
      admin: "Admin",
      contact: "Contact"
    },
    car: {
      name: "Car Name",
      year: "Year",
      category: "Category",
      price: "Price",
      perDay: "per day",
      available: "Available",
      notAvailable: "Not Available",
      quantity: "Quantity",
      description: "Description",
      images: "Images",
      addToRent: "Add to Rent",
      rentCar: "Rent Car",
      details: "Details",
      rating: "Rating",
      reviews: "Reviews"
    },
    addCar: {
      title: "Add My Car",
      carName: "Car Name",
      carNamePlaceholder: "Enter car name...",
      description: "Description",
      descriptionPlaceholder: "Brief information about the car...",
      price: "Price (UZS)",
      pricePlaceholder: "Enter price...",
      category: "Category",
      images: "Images",
      uploadImages: "Upload Images",
      submit: "Add",
      success: "Car added successfully!",
      error: "An error occurred. Please try again.",
      required: "This field is required"
    },
    profile: {
      title: "Profile",
      myCars: "My Cars",
      myOrders: "My Orders",
      myRentalCars: "Your Cars Rented Out",
      noCars: "You haven't added any cars yet",
      noOrders: "You don't have any orders yet",
      noRentalCars: "No cars rented out yet",
      addFirstCar: "Add your first car",
      carInfo: "Car Information",
      orderInfo: "Order Information",
      status: "Status",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      cancelOrder: "Cancel",
      rejectRental: "Reject",
      deleteCar: "Delete",
      editCar: "Edit",
      dataLoadError: "Failed to load data",
      carUpdated: "Car information updated!",
      carUpdateError: "Failed to update car",
      carDeleted: "Car deleted!",
      carDeleteError: "Failed to delete car",
      orderCancelled: "Order cancelled!",
      orderCancelError: "Failed to cancel order"
    },
    order: {
      title: "Rent a Car",
      customerName: "Your Name",
      customerPhone: "Phone",
      customerEmail: "Email",
      startDate: "Start Date",
      endDate: "End Date",
      submit: "Order",
      selectDates: "Please select dates in the navbar «Choose Day» first.",
      selectedDates: "Selected Date",
      overlap: "This car is already booked for these dates.",
      success: "Order accepted.",
      error: "An error occurred."
    },
    auth: {
      login: "Login",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      phone: "Phone",
      alreadyHave: "Already have an account?",
      dontHave: "Don't have an account?",
      loginSuccess: "Login successful!",
      signupSuccess: "Registration successful!",
      loginError: "Login error",
      signupError: "Registration error",
      pleaseLogin: "Please login first!"
    },
    admin: {
      title: "Admin Panel",
      codeRequired: "Admin code is required",
      invalidCode: "Invalid code",
      cars: "Cars",
      orders: "Orders",
      users: "Users",
      addCar: "Add Car",
      editCar: "Edit",
      deleteCar: "Delete",
      carAdded: "Car added",
      carUpdated: "Car updated",
      carDeleted: "Car deleted",
      nameRequired: "Enter car name.",
      yearRequired: "Enter production year.",
      imageRequired: "Select an image (from gallery).",
      imageTypeError: "Only image files (jpg, png, webp) are allowed.",
      qtyIncreased: "Quantity increased by 1 for the same car.",
      saved: "Saved.",
      deleted: "Deleted.",
      retryError: "Something went wrong. Please try again.",
      myCars: "My Cars",
      noCars: "No cars added yet.",
      returnToSales: "Return to Sales",
      confirmReturn: "Confirm return car to sales",
      returnSuccess: "Car successfully returned to sales!",
      returnError: "An error occurred",
      deleteOrderConfirm: "Confirm delete order",
      orderDeleted: "Order successfully deleted!",
      orderDeleteError: "An error occurred",
      image: "Image (from gallery)",
      carName: "Car Name",
      carNamePlaceholder: "e.g. Chevrolet Malibu",
      year: "Production Year",
      yearPlaceholder: "e.g. 2023",
      description: "Car Description",
      descriptionPlaceholder: "e.g. Two-door sedan, automatic transmission, air conditioning, camera",
      price: "Price (per day)",
      pricePlaceholder: "e.g. 200 thousand",
      category: "Category",
      saving: "Saving...",
      editTitle: "Edit Car",
      cancel: "Cancel",
      pricePerDay: "UZS / day",
      available: "Available: {count} units",
      customerName: "customer",
      customerPhone: "Phone: {phone}",
      customerBought: "bought a car model.",
      dates: "{start} — {end}"
    },
    contact: {
      title: "Contact",
      phone: "Phone",
      instagram: "Instagram",
      telegram: "Telegram"
    },
    landing: {
      premiumFeel: "Feel like a premium car owner!",
      bestService: "The best car rental service!",
      orderNow: "Order a car right now and get it within 15 minutes!",
      getInMinutes: "Order a car right now and get it within 15 minutes!",
      discoverWorld: "DISCOVER THE WORLD",
      carRental: "Car Rental",
      drivingCar: "drivingCar",
      getIn15Minutes: "15 minutes",
      orderNowBtn: "Order >",
      aboutRental: "About drivingCar car rental",
      allCars: "All Cars",
      exclusiveCollection: "Exclusive Collection",
      premiumCatalog: "Premium Catalog",
      affordable: "Within affordable price",
      transparent: "Maximum service transparency",
      idealCondition: "Ideal technical condition",
      delivery: "Delivery to your convenient location",
      fastDocuments: "Documents ready in 15 minutes",
      contacts: "Contacts",
      phoneNumber: "Phone Number",
      address: "Address:",
      needWebsite: "Need such a website? Then contact us",
      connectWithUs: "Telegram",
      whyChooseUs: "Why customers",
      drivingCarBrand: "«DRIVING CAR»",
      partnershipBenefits: "Partnering with us gives you the highest privileges and service quality.",
      largeParking: "Large parking",
      parkingDesc: "Suitable for any taste",
      cleanCars: "Clean cars",
      cleanCarsDesc: "Guaranteed ideal cleanliness",
      comfortClass: "Comfort class",
      comfortClassDesc: "Premium comfort",
      technicalIdeal: "Technical ideal",
      technicalIdealDesc: "Fully checked"
    }
  }
};
