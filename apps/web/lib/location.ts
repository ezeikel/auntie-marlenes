import { type Currency, getCurrencyByCode, currencies } from './currency';

export type ShippingZone = 'UK' | 'US' | 'UAE' | 'EU' | 'ROW';

export type CountryInfo = {
  code: string;
  name: string;
  flag: string;
  currency: Currency;
  zone: ShippingZone;
};

// Priority countries that appear at the top of the selector
export const priorityCountries: CountryInfo[] = [
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: getCurrencyByCode('GBP'),
    zone: 'UK',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: getCurrencyByCode('USD'),
    zone: 'US',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: getCurrencyByCode('CAD'),
    zone: 'ROW',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: getCurrencyByCode('AED'),
    zone: 'UAE',
  },
];

// Helper function to get currency with USD fallback
const getCurrency = (code: string): Currency => {
  return getCurrencyByCode(code) || getCurrencyByCode('USD');
};

// All available countries - comprehensive global coverage
export const allCountries: CountryInfo[] = [
  ...priorityCountries,

  // EUROPE - European Union & EEA
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    currency: getCurrency('BGN'),
    zone: 'EU',
  },
  {
    code: 'HR',
    name: 'Croatia',
    flag: '🇭🇷',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'CY',
    name: 'Cyprus',
    flag: '🇨🇾',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    flag: '🇨🇿',
    currency: getCurrency('CZK'),
    zone: 'EU',
  },
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    currency: getCurrency('DKK'),
    zone: 'EU',
  },
  {
    code: 'EE',
    name: 'Estonia',
    flag: '🇪🇪',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'FI',
    name: 'Finland',
    flag: '🇫🇮',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'HU',
    name: 'Hungary',
    flag: '🇭🇺',
    currency: getCurrency('HUF'),
    zone: 'EU',
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'LV',
    name: 'Latvia',
    flag: '🇱🇻',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'LT',
    name: 'Lithuania',
    flag: '🇱🇹',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'MT',
    name: 'Malta',
    flag: '🇲🇹',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    currency: getCurrency('PLN'),
    zone: 'EU',
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    currency: getCurrency('RON'),
    zone: 'EU',
  },
  {
    code: 'SK',
    name: 'Slovakia',
    flag: '🇸🇰',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'SI',
    name: 'Slovenia',
    flag: '🇸🇮',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: getCurrency('EUR'),
    zone: 'EU',
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    currency: getCurrency('SEK'),
    zone: 'EU',
  },

  // EUROPE - Non-EU
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    currency: getCurrency('NOK'),
    zone: 'EU',
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    currency: getCurrency('CHF'),
    zone: 'ROW',
  },
  {
    code: 'IS',
    name: 'Iceland',
    flag: '🇮🇸',
    currency: getCurrency('ISK'),
    zone: 'ROW',
  },
  {
    code: 'AL',
    name: 'Albania',
    flag: '🇦🇱',
    currency: getCurrency('ALL'),
    zone: 'ROW',
  },
  {
    code: 'AD',
    name: 'Andorra',
    flag: '🇦🇩',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },
  {
    code: 'BY',
    name: 'Belarus',
    flag: '🇧🇾',
    currency: getCurrency('BYN'),
    zone: 'ROW',
  },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    currency: getCurrency('BAM'),
    zone: 'ROW',
  },
  {
    code: 'GI',
    name: 'Gibraltar',
    flag: '🇬🇮',
    currency: getCurrency('GBP'),
    zone: 'ROW',
  },
  {
    code: 'GG',
    name: 'Guernsey',
    flag: '🇬🇬',
    currency: getCurrency('GBP'),
    zone: 'ROW',
  },
  {
    code: 'IM',
    name: 'Isle of Man',
    flag: '🇮🇲',
    currency: getCurrency('GBP'),
    zone: 'ROW',
  },
  {
    code: 'JE',
    name: 'Jersey',
    flag: '🇯🇪',
    currency: getCurrency('GBP'),
    zone: 'ROW',
  },
  {
    code: 'XK',
    name: 'Kosovo',
    flag: '🇽🇰',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },
  {
    code: 'LI',
    name: 'Liechtenstein',
    flag: '🇱🇮',
    currency: getCurrency('CHF'),
    zone: 'ROW',
  },
  {
    code: 'MK',
    name: 'North Macedonia',
    flag: '🇲🇰',
    currency: getCurrency('MKD'),
    zone: 'ROW',
  },
  {
    code: 'MD',
    name: 'Moldova',
    flag: '🇲🇩',
    currency: getCurrency('MDL'),
    zone: 'ROW',
  },
  {
    code: 'MC',
    name: 'Monaco',
    flag: '🇲🇨',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },
  {
    code: 'ME',
    name: 'Montenegro',
    flag: '🇲🇪',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    currency: getCurrency('RUB'),
    zone: 'ROW',
  },
  {
    code: 'SM',
    name: 'San Marino',
    flag: '🇸🇲',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },
  {
    code: 'RS',
    name: 'Serbia',
    flag: '🇷🇸',
    currency: getCurrency('RSD'),
    zone: 'ROW',
  },
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    currency: getCurrency('UAH'),
    zone: 'ROW',
  },
  {
    code: 'VA',
    name: 'Vatican City',
    flag: '🇻🇦',
    currency: getCurrency('EUR'),
    zone: 'ROW',
  },

  // AMERICAS - North America
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: getCurrency('CAD'),
    zone: 'ROW',
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    currency: getCurrency('MXN'),
    zone: 'ROW',
  },

  // AMERICAS - Central America & Caribbean
  {
    code: 'BZ',
    name: 'Belize',
    flag: '🇧🇿',
    currency: getCurrency('BZD'),
    zone: 'ROW',
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    flag: '🇨🇷',
    currency: getCurrency('CRC'),
    zone: 'ROW',
  },
  {
    code: 'SV',
    name: 'El Salvador',
    flag: '🇸🇻',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'GT',
    name: 'Guatemala',
    flag: '🇬🇹',
    currency: getCurrency('GTQ'),
    zone: 'ROW',
  },
  {
    code: 'HN',
    name: 'Honduras',
    flag: '🇭🇳',
    currency: getCurrency('HNL'),
    zone: 'ROW',
  },
  {
    code: 'NI',
    name: 'Nicaragua',
    flag: '🇳🇮',
    currency: getCurrency('NIO'),
    zone: 'ROW',
  },
  {
    code: 'PA',
    name: 'Panama',
    flag: '🇵🇦',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'AG',
    name: 'Antigua and Barbuda',
    flag: '🇦🇬',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'BS',
    name: 'Bahamas',
    flag: '🇧🇸',
    currency: getCurrency('BSD'),
    zone: 'ROW',
  },
  {
    code: 'BB',
    name: 'Barbados',
    flag: '🇧🇧',
    currency: getCurrency('BBD'),
    zone: 'ROW',
  },
  {
    code: 'CU',
    name: 'Cuba',
    flag: '🇨🇺',
    currency: getCurrency('CUP'),
    zone: 'ROW',
  },
  {
    code: 'DM',
    name: 'Dominica',
    flag: '🇩🇲',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    flag: '🇩🇴',
    currency: getCurrency('DOP'),
    zone: 'ROW',
  },
  {
    code: 'GD',
    name: 'Grenada',
    flag: '🇬🇩',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'HT',
    name: 'Haiti',
    flag: '🇭🇹',
    currency: getCurrency('HTG'),
    zone: 'ROW',
  },
  {
    code: 'JM',
    name: 'Jamaica',
    flag: '🇯🇲',
    currency: getCurrency('JMD'),
    zone: 'ROW',
  },
  {
    code: 'KN',
    name: 'Saint Kitts and Nevis',
    flag: '🇰🇳',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'LC',
    name: 'Saint Lucia',
    flag: '🇱🇨',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'VC',
    name: 'Saint Vincent and the Grenadines',
    flag: '🇻🇨',
    currency: getCurrency('XCD'),
    zone: 'ROW',
  },
  {
    code: 'TT',
    name: 'Trinidad and Tobago',
    flag: '🇹🇹',
    currency: getCurrency('TTD'),
    zone: 'ROW',
  },

  // AMERICAS - South America
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: getCurrency('ARS'),
    zone: 'ROW',
  },
  {
    code: 'BO',
    name: 'Bolivia',
    flag: '🇧🇴',
    currency: getCurrency('BOB'),
    zone: 'ROW',
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currency: getCurrency('BRL'),
    zone: 'ROW',
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    currency: getCurrency('CLP'),
    zone: 'ROW',
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: getCurrency('COP'),
    zone: 'ROW',
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'GY',
    name: 'Guyana',
    flag: '🇬🇾',
    currency: getCurrency('GYD'),
    zone: 'ROW',
  },
  {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    currency: getCurrency('PYG'),
    zone: 'ROW',
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    currency: getCurrency('PEN'),
    zone: 'ROW',
  },
  {
    code: 'SR',
    name: 'Suriname',
    flag: '🇸🇷',
    currency: getCurrency('SRD'),
    zone: 'ROW',
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    currency: getCurrency('UYU'),
    zone: 'ROW',
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    currency: getCurrency('VES'),
    zone: 'ROW',
  },

  // ASIA - East Asia
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: getCurrency('CNY'),
    zone: 'ROW',
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: getCurrency('JPY'),
    zone: 'ROW',
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    currency: getCurrency('KRW'),
    zone: 'ROW',
  },
  {
    code: 'KP',
    name: 'North Korea',
    flag: '🇰🇵',
    currency: getCurrency('KPW'),
    zone: 'ROW',
  },
  {
    code: 'MN',
    name: 'Mongolia',
    flag: '🇲🇳',
    currency: getCurrency('MNT'),
    zone: 'ROW',
  },
  {
    code: 'TW',
    name: 'Taiwan',
    flag: '🇹🇼',
    currency: getCurrency('TWD'),
    zone: 'ROW',
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    flag: '🇭🇰',
    currency: getCurrency('HKD'),
    zone: 'ROW',
  },
  {
    code: 'MO',
    name: 'Macau',
    flag: '🇲🇴',
    currency: getCurrency('MOP'),
    zone: 'ROW',
  },

  // ASIA - Southeast Asia
  {
    code: 'BN',
    name: 'Brunei',
    flag: '🇧🇳',
    currency: getCurrency('BND'),
    zone: 'ROW',
  },
  {
    code: 'KH',
    name: 'Cambodia',
    flag: '🇰🇭',
    currency: getCurrency('KHR'),
    zone: 'ROW',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: getCurrency('IDR'),
    zone: 'ROW',
  },
  {
    code: 'LA',
    name: 'Laos',
    flag: '🇱🇦',
    currency: getCurrency('LAK'),
    zone: 'ROW',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    currency: getCurrency('MYR'),
    zone: 'ROW',
  },
  {
    code: 'MM',
    name: 'Myanmar',
    flag: '🇲🇲',
    currency: getCurrency('MMK'),
    zone: 'ROW',
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: getCurrency('PHP'),
    zone: 'ROW',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: getCurrency('SGD'),
    zone: 'ROW',
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    currency: getCurrency('THB'),
    zone: 'ROW',
  },
  {
    code: 'TL',
    name: 'Timor-Leste',
    flag: '🇹🇱',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    currency: getCurrency('VND'),
    zone: 'ROW',
  },

  // ASIA - South Asia
  {
    code: 'AF',
    name: 'Afghanistan',
    flag: '🇦🇫',
    currency: getCurrency('AFN'),
    zone: 'ROW',
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    currency: getCurrency('BDT'),
    zone: 'ROW',
  },
  {
    code: 'BT',
    name: 'Bhutan',
    flag: '🇧🇹',
    currency: getCurrency('BTN'),
    zone: 'ROW',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: getCurrency('INR'),
    zone: 'ROW',
  },
  {
    code: 'MV',
    name: 'Maldives',
    flag: '🇲🇻',
    currency: getCurrency('MVR'),
    zone: 'ROW',
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
    currency: getCurrency('NPR'),
    zone: 'ROW',
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currency: getCurrency('PKR'),
    zone: 'ROW',
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    flag: '🇱🇰',
    currency: getCurrency('LKR'),
    zone: 'ROW',
  },

  // ASIA - Central Asia
  {
    code: 'KZ',
    name: 'Kazakhstan',
    flag: '🇰🇿',
    currency: getCurrency('KZT'),
    zone: 'ROW',
  },
  {
    code: 'KG',
    name: 'Kyrgyzstan',
    flag: '🇰🇬',
    currency: getCurrency('KGS'),
    zone: 'ROW',
  },
  {
    code: 'TJ',
    name: 'Tajikistan',
    flag: '🇹🇯',
    currency: getCurrency('TJS'),
    zone: 'ROW',
  },
  {
    code: 'TM',
    name: 'Turkmenistan',
    flag: '🇹🇲',
    currency: getCurrency('TMT'),
    zone: 'ROW',
  },
  {
    code: 'UZ',
    name: 'Uzbekistan',
    flag: '🇺🇿',
    currency: getCurrency('UZS'),
    zone: 'ROW',
  },

  // MIDDLE EAST - Gulf States
  {
    code: 'BH',
    name: 'Bahrain',
    flag: '🇧🇭',
    currency: getCurrency('BHD'),
    zone: 'UAE',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    flag: '🇰🇼',
    currency: getCurrency('KWD'),
    zone: 'UAE',
  },
  {
    code: 'OM',
    name: 'Oman',
    flag: '🇴🇲',
    currency: getCurrency('OMR'),
    zone: 'UAE',
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    currency: getCurrency('QAR'),
    zone: 'UAE',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: getCurrency('SAR'),
    zone: 'UAE',
  },

  // MIDDLE EAST - Other
  {
    code: 'AM',
    name: 'Armenia',
    flag: '🇦🇲',
    currency: getCurrency('AMD'),
    zone: 'ROW',
  },
  {
    code: 'AZ',
    name: 'Azerbaijan',
    flag: '🇦🇿',
    currency: getCurrency('AZN'),
    zone: 'ROW',
  },
  {
    code: 'GE',
    name: 'Georgia',
    flag: '🇬🇪',
    currency: getCurrency('GEL'),
    zone: 'ROW',
  },
  {
    code: 'IQ',
    name: 'Iraq',
    flag: '🇮🇶',
    currency: getCurrency('IQD'),
    zone: 'ROW',
  },
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    currency: getCurrency('ILS'),
    zone: 'ROW',
  },
  {
    code: 'JO',
    name: 'Jordan',
    flag: '🇯🇴',
    currency: getCurrency('JOD'),
    zone: 'ROW',
  },
  {
    code: 'LB',
    name: 'Lebanon',
    flag: '🇱🇧',
    currency: getCurrency('LBP'),
    zone: 'ROW',
  },
  {
    code: 'PS',
    name: 'Palestine',
    flag: '🇵🇸',
    currency: getCurrency('ILS'),
    zone: 'ROW',
  },
  {
    code: 'SY',
    name: 'Syria',
    flag: '🇸🇾',
    currency: getCurrency('SYP'),
    zone: 'ROW',
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    currency: getCurrency('TRY'),
    zone: 'ROW',
  },
  {
    code: 'YE',
    name: 'Yemen',
    flag: '🇾🇪',
    currency: getCurrency('YER'),
    zone: 'ROW',
  },
  {
    code: 'IR',
    name: 'Iran',
    flag: '🇮🇷',
    currency: getCurrency('IRR'),
    zone: 'ROW',
  },

  // AFRICA - North Africa
  {
    code: 'DZ',
    name: 'Algeria',
    flag: '🇩🇿',
    currency: getCurrency('DZD'),
    zone: 'ROW',
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    currency: getCurrency('EGP'),
    zone: 'ROW',
  },
  {
    code: 'LY',
    name: 'Libya',
    flag: '🇱🇾',
    currency: getCurrency('LYD'),
    zone: 'ROW',
  },
  {
    code: 'MA',
    name: 'Morocco',
    flag: '🇲🇦',
    currency: getCurrency('MAD'),
    zone: 'ROW',
  },
  {
    code: 'SD',
    name: 'Sudan',
    flag: '🇸🇩',
    currency: getCurrency('SDG'),
    zone: 'ROW',
  },
  {
    code: 'TN',
    name: 'Tunisia',
    flag: '🇹🇳',
    currency: getCurrency('TND'),
    zone: 'ROW',
  },
  {
    code: 'EH',
    name: 'Western Sahara',
    flag: '🇪🇭',
    currency: getCurrency('MAD'),
    zone: 'ROW',
  },

  // AFRICA - West Africa
  {
    code: 'BJ',
    name: 'Benin',
    flag: '🇧🇯',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'CV',
    name: 'Cape Verde',
    flag: '🇨🇻',
    currency: getCurrency('CVE'),
    zone: 'ROW',
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'GM',
    name: 'Gambia',
    flag: '🇬🇲',
    currency: getCurrency('GMD'),
    zone: 'ROW',
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: getCurrency('GHS'),
    zone: 'ROW',
  },
  {
    code: 'GN',
    name: 'Guinea',
    flag: '🇬🇳',
    currency: getCurrency('GNF'),
    zone: 'ROW',
  },
  {
    code: 'GW',
    name: 'Guinea-Bissau',
    flag: '🇬🇼',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'LR',
    name: 'Liberia',
    flag: '🇱🇷',
    currency: getCurrency('LRD'),
    zone: 'ROW',
  },
  {
    code: 'ML',
    name: 'Mali',
    flag: '🇲🇱',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'MR',
    name: 'Mauritania',
    flag: '🇲🇷',
    currency: getCurrency('MRU'),
    zone: 'ROW',
  },
  {
    code: 'NE',
    name: 'Niger',
    flag: '🇳🇪',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: getCurrency('NGN'),
    zone: 'ROW',
  },
  {
    code: 'SN',
    name: 'Senegal',
    flag: '🇸🇳',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },
  {
    code: 'SL',
    name: 'Sierra Leone',
    flag: '🇸🇱',
    currency: getCurrency('SLL'),
    zone: 'ROW',
  },
  {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    currency: getCurrency('XOF'),
    zone: 'ROW',
  },

  // AFRICA - East Africa
  {
    code: 'BI',
    name: 'Burundi',
    flag: '🇧🇮',
    currency: getCurrency('BIF'),
    zone: 'ROW',
  },
  {
    code: 'KM',
    name: 'Comoros',
    flag: '🇰🇲',
    currency: getCurrency('KMF'),
    zone: 'ROW',
  },
  {
    code: 'DJ',
    name: 'Djibouti',
    flag: '🇩🇯',
    currency: getCurrency('DJF'),
    zone: 'ROW',
  },
  {
    code: 'ER',
    name: 'Eritrea',
    flag: '🇪🇷',
    currency: getCurrency('ERN'),
    zone: 'ROW',
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    flag: '🇪🇹',
    currency: getCurrency('ETB'),
    zone: 'ROW',
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: getCurrency('KES'),
    zone: 'ROW',
  },
  {
    code: 'MG',
    name: 'Madagascar',
    flag: '🇲🇬',
    currency: getCurrency('MGA'),
    zone: 'ROW',
  },
  {
    code: 'MW',
    name: 'Malawi',
    flag: '🇲🇼',
    currency: getCurrency('MWK'),
    zone: 'ROW',
  },
  {
    code: 'MU',
    name: 'Mauritius',
    flag: '🇲🇺',
    currency: getCurrency('MUR'),
    zone: 'ROW',
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    flag: '🇲🇿',
    currency: getCurrency('MZN'),
    zone: 'ROW',
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: getCurrency('RWF'),
    zone: 'ROW',
  },
  {
    code: 'SC',
    name: 'Seychelles',
    flag: '🇸🇨',
    currency: getCurrency('SCR'),
    zone: 'ROW',
  },
  {
    code: 'SO',
    name: 'Somalia',
    flag: '🇸🇴',
    currency: getCurrency('SOS'),
    zone: 'ROW',
  },
  {
    code: 'SS',
    name: 'South Sudan',
    flag: '🇸🇸',
    currency: getCurrency('SSP'),
    zone: 'ROW',
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    currency: getCurrency('TZS'),
    zone: 'ROW',
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    currency: getCurrency('UGX'),
    zone: 'ROW',
  },
  {
    code: 'ZM',
    name: 'Zambia',
    flag: '🇿🇲',
    currency: getCurrency('ZMW'),
    zone: 'ROW',
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },

  // AFRICA - Central Africa
  {
    code: 'AO',
    name: 'Angola',
    flag: '🇦🇴',
    currency: getCurrency('AOA'),
    zone: 'ROW',
  },
  {
    code: 'CM',
    name: 'Cameroon',
    flag: '🇨🇲',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'CF',
    name: 'Central African Republic',
    flag: '🇨🇫',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'TD',
    name: 'Chad',
    flag: '🇹🇩',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'CG',
    name: 'Congo',
    flag: '🇨🇬',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'CD',
    name: 'Democratic Republic of the Congo',
    flag: '🇨🇩',
    currency: getCurrency('CDF'),
    zone: 'ROW',
  },
  {
    code: 'GQ',
    name: 'Equatorial Guinea',
    flag: '🇬🇶',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    currency: getCurrency('XAF'),
    zone: 'ROW',
  },
  {
    code: 'ST',
    name: 'São Tomé and Príncipe',
    flag: '🇸🇹',
    currency: getCurrency('STN'),
    zone: 'ROW',
  },

  // AFRICA - Southern Africa
  {
    code: 'BW',
    name: 'Botswana',
    flag: '🇧🇼',
    currency: getCurrency('BWP'),
    zone: 'ROW',
  },
  {
    code: 'LS',
    name: 'Lesotho',
    flag: '🇱🇸',
    currency: getCurrency('LSL'),
    zone: 'ROW',
  },
  {
    code: 'NA',
    name: 'Namibia',
    flag: '🇳🇦',
    currency: getCurrency('NAD'),
    zone: 'ROW',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: getCurrency('ZAR'),
    zone: 'ROW',
  },
  {
    code: 'SZ',
    name: 'Eswatini',
    flag: '🇸🇿',
    currency: getCurrency('SZL'),
    zone: 'ROW',
  },

  // OCEANIA
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: getCurrency('AUD'),
    zone: 'ROW',
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: getCurrency('NZD'),
    zone: 'ROW',
  },
  {
    code: 'FJ',
    name: 'Fiji',
    flag: '🇫🇯',
    currency: getCurrency('FJD'),
    zone: 'ROW',
  },
  {
    code: 'PG',
    name: 'Papua New Guinea',
    flag: '🇵🇬',
    currency: getCurrency('PGK'),
    zone: 'ROW',
  },
  {
    code: 'SB',
    name: 'Solomon Islands',
    flag: '🇸🇧',
    currency: getCurrency('SBD'),
    zone: 'ROW',
  },
  {
    code: 'VU',
    name: 'Vanuatu',
    flag: '🇻🇺',
    currency: getCurrency('VUV'),
    zone: 'ROW',
  },
  {
    code: 'NC',
    name: 'New Caledonia',
    flag: '🇳🇨',
    currency: getCurrency('XPF'),
    zone: 'ROW',
  },
  {
    code: 'PF',
    name: 'French Polynesia',
    flag: '🇵🇫',
    currency: getCurrency('XPF'),
    zone: 'ROW',
  },
  {
    code: 'WS',
    name: 'Samoa',
    flag: '🇼🇸',
    currency: getCurrency('WST'),
    zone: 'ROW',
  },
  {
    code: 'KI',
    name: 'Kiribati',
    flag: '🇰🇮',
    currency: getCurrency('AUD'),
    zone: 'ROW',
  },
  {
    code: 'TO',
    name: 'Tonga',
    flag: '🇹🇴',
    currency: getCurrency('TOP'),
    zone: 'ROW',
  },
  {
    code: 'FM',
    name: 'Micronesia',
    flag: '🇫🇲',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'MH',
    name: 'Marshall Islands',
    flag: '🇲🇭',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'PW',
    name: 'Palau',
    flag: '🇵🇼',
    currency: getCurrency('USD'),
    zone: 'ROW',
  },
  {
    code: 'NR',
    name: 'Nauru',
    flag: '🇳🇷',
    currency: getCurrency('AUD'),
    zone: 'ROW',
  },
  {
    code: 'TV',
    name: 'Tuvalu',
    flag: '🇹🇻',
    currency: getCurrency('AUD'),
    zone: 'ROW',
  },
];

// Get country info by country code
export const getCountryByCode = (code: string): CountryInfo | undefined => {
  return allCountries.find((country) => country.code === code);
};

// Get default country (UK)
export const getDefaultCountry = (): CountryInfo => {
  return priorityCountries[0]; // UK
};

// Get currency for a country code
export const getCurrencyForCountry = (countryCode: string): Currency => {
  const country = getCountryByCode(countryCode);
  return country?.currency || getCurrencyByCode('GBP');
};

// Get shipping zone for a country code
export const getShippingZone = (countryCode: string): ShippingZone => {
  const country = getCountryByCode(countryCode);
  return country?.zone || 'ROW';
};

// Detect user's country from request headers (for server-side use)
export const detectCountryFromHeaders = (
  headers: Headers,
): string | undefined => {
  // Try Vercel's geolocation headers first
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry;
  }

  // Try Cloudflare headers
  const cloudflareCountry = headers.get('cf-ipcountry');
  if (cloudflareCountry) {
    return cloudflareCountry;
  }

  return undefined;
};

// Client-side country detection (using browser)
export const detectCountryFromBrowser = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  // Try to get from browser's locale
  const locale = navigator.language;
  if (locale) {
    // Extract country code from locale (e.g., 'en-GB' -> 'GB')
    const parts = locale.split('-');
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
  }

  return undefined;
};

// Get or detect country (tries storage first, then detection, then default)
export const getCurrentCountry = (detectedCountry?: string): CountryInfo => {
  // Try to use detected country
  if (detectedCountry) {
    const country = getCountryByCode(detectedCountry);
    if (country) return country;
  }

  // Try browser detection
  const browserCountry = detectCountryFromBrowser();
  if (browserCountry) {
    const country = getCountryByCode(browserCountry);
    if (country) return country;
  }

  // Fall back to default (UK)
  return getDefaultCountry();
};
