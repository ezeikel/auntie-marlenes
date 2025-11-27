export type Currency = {
  code: string
  symbol: string
  name: string
  flag: string
}

export const currencies: Currency[] = [
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },

  // Major Asian Currencies
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "HKD", symbol: "$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },

  // Gulf States Currencies
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", flag: "🇴🇲" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", flag: "🇸🇦" },

  // EU Non-Euro Currencies
  { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", flag: "🇧🇬" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },

  // Other Major Markets
  { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  { code: "NZD", symbol: "$", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", flag: "🇮🇸" },

  // Tier 1 - Major Latin American Economies
  { code: "ARS", symbol: "$", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", flag: "🇺🇾" },
  { code: "BOB", symbol: "Bs.", name: "Bolivian Boliviano", flag: "🇧🇴" },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní", flag: "🇵🇾" },
  { code: "VES", symbol: "Bs.S", name: "Venezuelan Bolívar", flag: "🇻🇪" },

  // Tier 1 - Major Asian Economies
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "VND", symbol: "₫", name: "Vietnamese Đồng", flag: "🇻🇳" },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", flag: "🇹🇼" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },

  // Tier 1 - Major African/Middle Eastern
  { code: "EGP", symbol: "£E", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", flag: "🇯🇲" },

  // Tier 2 - Regional Shared Currencies
  { code: "XCD", symbol: "$", name: "East Caribbean Dollar", flag: "🇦🇬" },
  { code: "XOF", symbol: "Fr", name: "West African CFA Franc", flag: "🇸🇳" },
  { code: "XAF", symbol: "Fr", name: "Central African CFA Franc", flag: "🇨🇲" },
  { code: "XPF", symbol: "Fr", name: "CFP Franc", flag: "🇵🇫" },

  // Europe - Non-EU Currencies
  { code: "ALL", symbol: "L", name: "Albanian Lek", flag: "🇦🇱" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble", flag: "🇧🇾" },
  { code: "BAM", symbol: "KM", name: "Bosnia-Herzegovina Mark", flag: "🇧🇦" },
  { code: "MKD", symbol: "ден", name: "Macedonian Denar", flag: "🇲🇰" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu", flag: "🇲🇩" },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar", flag: "🇷🇸" },

  // Central America & Caribbean
  { code: "BZD", symbol: "BZ$", name: "Belize Dollar", flag: "🇧🇿" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", flag: "🇨🇷" },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal", flag: "🇬🇹" },
  { code: "HNL", symbol: "L", name: "Honduran Lempira", flag: "🇭🇳" },
  { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba", flag: "🇳🇮" },
  { code: "BSD", symbol: "B$", name: "Bahamian Dollar", flag: "🇧🇸" },
  { code: "BBD", symbol: "Bds$", name: "Barbadian Dollar", flag: "🇧🇧" },
  { code: "CUP", symbol: "$", name: "Cuban Peso", flag: "🇨🇺" },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso", flag: "🇩🇴" },
  { code: "HTG", symbol: "G", name: "Haitian Gourde", flag: "🇭🇹" },
  { code: "TTD", symbol: "TT$", name: "Trinidad & Tobago Dollar", flag: "🇹🇹" },

  // South America - Additional
  { code: "GYD", symbol: "G$", name: "Guyanese Dollar", flag: "🇬🇾" },
  { code: "SRD", symbol: "$", name: "Surinamese Dollar", flag: "🇸🇷" },

  // Asia - East Asia
  { code: "KPW", symbol: "₩", name: "North Korean Won", flag: "🇰🇵" },
  { code: "MNT", symbol: "₮", name: "Mongolian Tögrög", flag: "🇲🇳" },
  { code: "MOP", symbol: "MOP$", name: "Macanese Pataca", flag: "🇲🇴" },

  // Asia - Southeast Asia
  { code: "BND", symbol: "B$", name: "Brunei Dollar", flag: "🇧🇳" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", flag: "🇰🇭" },
  { code: "LAK", symbol: "₭", name: "Lao Kip", flag: "🇱🇦" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", flag: "🇲🇲" },

  // Asia - South Asia
  { code: "AFN", symbol: "؋", name: "Afghan Afghani", flag: "🇦🇫" },
  { code: "BTN", symbol: "Nu.", name: "Bhutanese Ngultrum", flag: "🇧🇹" },
  { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa", flag: "🇲🇻" },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },

  // Asia - Central Asia
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", flag: "🇰🇿" },
  { code: "KGS", symbol: "с", name: "Kyrgyzstani Som", flag: "🇰🇬" },
  { code: "TJS", symbol: "ЅМ", name: "Tajikistani Somoni", flag: "🇹🇯" },
  { code: "TMT", symbol: "m", name: "Turkmenistan Manat", flag: "🇹🇲" },
  { code: "UZS", symbol: "so'm", name: "Uzbekistani Som", flag: "🇺🇿" },

  // Middle East
  { code: "AMD", symbol: "֏", name: "Armenian Dram", flag: "🇦🇲" },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", flag: "🇦🇿" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", flag: "🇬🇪" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar", flag: "🇮🇶" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound", flag: "🇱🇧" },
  { code: "SYP", symbol: "£S", name: "Syrian Pound", flag: "🇸🇾" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial", flag: "🇾🇪" },
  { code: "IRR", symbol: "﷼", name: "Iranian Rial", flag: "🇮🇷" },

  // Africa - North
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar", flag: "🇩🇿" },
  { code: "LYD", symbol: "ل.د", name: "Libyan Dinar", flag: "🇱🇾" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", flag: "🇲🇦" },
  { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound", flag: "🇸🇩" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar", flag: "🇹🇳" },

  // Africa - West
  { code: "CVE", symbol: "$", name: "Cape Verdean Escudo", flag: "🇨🇻" },
  { code: "GMD", symbol: "D", name: "Gambian Dalasi", flag: "🇬🇲" },
  { code: "GNF", symbol: "Fr", name: "Guinean Franc", flag: "🇬🇳" },
  { code: "LRD", symbol: "L$", name: "Liberian Dollar", flag: "🇱🇷" },
  { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya", flag: "🇲🇷" },
  { code: "SLL", symbol: "Le", name: "Sierra Leonean Leone", flag: "🇸🇱" },

  // Africa - East
  { code: "BIF", symbol: "Fr", name: "Burundian Franc", flag: "🇧🇮" },
  { code: "KMF", symbol: "Fr", name: "Comorian Franc", flag: "🇰🇲" },
  { code: "DJF", symbol: "Fr", name: "Djiboutian Franc", flag: "🇩🇯" },
  { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa", flag: "🇪🇷" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", flag: "🇪🇹" },
  { code: "MGA", symbol: "Ar", name: "Malagasy Ariary", flag: "🇲🇬" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", flag: "🇲🇼" },
  { code: "MUR", symbol: "Rs", name: "Mauritian Rupee", flag: "🇲🇺" },
  { code: "MZN", symbol: "MT", name: "Mozambican Metical", flag: "🇲🇿" },
  { code: "RWF", symbol: "Fr", name: "Rwandan Franc", flag: "🇷🇼" },
  { code: "SCR", symbol: "Rs", name: "Seychellois Rupee", flag: "🇸🇨" },
  { code: "SOS", symbol: "Sh", name: "Somali Shilling", flag: "🇸🇴" },
  { code: "SSP", symbol: "£", name: "South Sudanese Pound", flag: "🇸🇸" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", flag: "🇺🇬" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", flag: "🇿🇲" },

  // Africa - Central
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", flag: "🇦🇴" },
  { code: "CDF", symbol: "Fr", name: "Congolese Franc", flag: "🇨🇩" },
  { code: "STN", symbol: "Db", name: "São Tomé Dobra", flag: "🇸🇹" },

  // Africa - Southern
  { code: "BWP", symbol: "P", name: "Botswana Pula", flag: "🇧🇼" },
  { code: "LSL", symbol: "L", name: "Lesotho Loti", flag: "🇱🇸" },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar", flag: "🇳🇦" },
  { code: "SZL", symbol: "L", name: "Swazi Lilangeni", flag: "🇸🇿" },

  // Oceania
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", flag: "🇫🇯" },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina", flag: "🇵🇬" },
  { code: "SBD", symbol: "SI$", name: "Solomon Islands Dollar", flag: "🇸🇧" },
  { code: "VUV", symbol: "Vt", name: "Vanuatu Vatu", flag: "🇻🇺" },
  { code: "WST", symbol: "T", name: "Samoan Tālā", flag: "🇼🇸" },
  { code: "TOP", symbol: "T$", name: "Tongan Paʻanga", flag: "🇹🇴" },
]

export const defaultCurrency: Currency = currencies[0]

export const getCurrencyByCode = (code: string): Currency => {
  return currencies.find((curr) => curr.code === code) || defaultCurrency
}

/**
 * Map currency codes to their natural locales for proper formatting
 * Falls back to generic English if no specific locale is found
 */
const getLocaleForCurrency = (currencyCode: string): string => {
  const localeMap: Record<string, string> = {
    // Major currencies
    GBP: "en-GB",
    EUR: "de-DE",
    USD: "en-US",
    AED: "ar-AE",
    CAD: "en-CA",
    AUD: "en-AU",

    // African currencies
    NGN: "en-NG",
    GHS: "en-GH",
    ZAR: "en-ZA",
    KES: "en-KE",

    // Asian currencies
    CNY: "zh-CN",
    JPY: "ja-JP",
    INR: "en-IN",
    KRW: "ko-KR",
    HKD: "en-HK",
    SGD: "en-SG",
    THB: "th-TH",
    PHP: "en-PH",
    IDR: "id-ID",
    MYR: "ms-MY",
    VND: "vi-VN",

    // European currencies
    SEK: "sv-SE",
    NOK: "nb-NO",
    DKK: "da-DK",
    CHF: "de-CH",
    PLN: "pl-PL",
    CZK: "cs-CZ",

    // Latin American currencies
    BRL: "pt-BR",
    MXN: "es-MX",
    ARS: "es-AR",
    COP: "es-CO",
    CLP: "es-CL",

    // Middle Eastern currencies
    SAR: "ar-SA",
    QAR: "ar-QA",
    KWD: "ar-KW",
    BHD: "ar-BH",
    OMR: "ar-OM",
    ILS: "he-IL",

    // Other
    TRY: "tr-TR",
    RUB: "ru-RU",
    NZD: "en-NZ",
  }

  return localeMap[currencyCode] || "en"
}

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const locale = getLocaleForCurrency(currencyCode)

  // Use Intl.NumberFormat with appropriate locale for proper currency formatting
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}
