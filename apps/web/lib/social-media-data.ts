export type SocialMediaVideo = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  author: string;
  productName?: string;
  productPrice?: number;
  productLink?: string;
};

export const socialMediaVideos: SocialMediaVideo[] = [
  // {
  //   id: "1",
  //   videoUrl:
  //     "/videos/social-media-showcase/1715835790968_14e6b48b-71a8-4571-9c5f-cace2ba16dab.mp4",
  //   thumbnailUrl: "/placeholder.svg?height=800&width=450&text=Hair+Care+Tutorial",
  //   caption: "therapeutic spa experience for hair & scalp",
  //   author: "@auntiemarlenes",
  //   productName: "Hair & Scalp Balm",
  //   productPrice: 36.0,
  //   productLink: "/product/1",
  // },
  {
    id: '2',
    videoUrl:
      '/videos/social-media-showcase/1716915799558_604bb3c7-2db1-40b8-9415-a8e99b99e240.mp4',
    thumbnailUrl:
      '/placeholder.svg?height=800&width=450&text=Skin+Care+Routine',
    caption: 'I use this every single day for glowing skin',
    author: '@beautylover',
    productName: 'Hydrating Face Serum',
    productPrice: 42.0,
    productLink: '/product/2',
  },
  // {
  //   id: "3",
  //   videoUrl:
  //     "/videos/social-media-showcase/1722661404900_fa912bc1-bd79-4d94-8099-bc5a012e4284.mp4",
  //   thumbnailUrl: "/placeholder.svg?height=800&width=450&text=Natural+Hair",
  //   caption: "absolutely love this for my natural hair!",
  //   author: "@naturalhairqueen",
  //   productName: "Hydrating Conditioner",
  //   productPrice: 31.0,
  //   productLink: "/product/3",
  // },
  {
    id: '4',
    videoUrl:
      '/videos/social-media-showcase/1728320606637_b807f4f2-20e9-48b8-9d7d-7e0eaf6f5c5d.mp4',
    thumbnailUrl: '/placeholder.svg?height=800&width=450&text=Skin+Glow',
    caption: 'POWERFUL SKIN CARE SECRET: natural ingredients',
    author: '@skincareguru',
    productName: 'Nourishing Body Butter',
    productPrice: 38.0,
    productLink: '/product/4',
  },
  {
    id: '5',
    videoUrl:
      '/videos/social-media-showcase/1740786295611_wid_NjdjMjRhNzdhY2FjNjcwMDQwY2ZmMDQy_h264cmobile.mp4',
    thumbnailUrl: '/placeholder.svg?height=800&width=450&text=Deep+Treatment',
    caption:
      'TAKE A DEEP DIVE INTO OUR AWARD-WINNING MOISTURIZING DEEP CONDITIONER',
    author: '@auntiemarlenes',
    productName: 'Deep Conditioner',
    productPrice: 39.0,
    productLink: '/product/5',
  },
  {
    id: '6',
    videoUrl:
      '/videos/social-media-showcase/1756140887235_wid_NjhhYzk1NTdiN2Y2MmUwMDU4ZjY1ZGNm_h264cmobile.mp4',
    thumbnailUrl: '/placeholder.svg?height=800&width=450&text=Curl+Definition',
    caption: 'My curls and skin have never looked better',
    author: '@curlygirl',
    productName: 'Curl Defining Cream',
    productPrice: 28.0,
    productLink: '/product/6',
  },
  {
    id: '7',
    videoUrl:
      '/videos/social-media-showcase/1759529737198_wid_NjhlMDRiMDg3NjE4MTA5ZmQ0MzdmMDIz_h264cmobile.mp4',
    thumbnailUrl: '/placeholder.svg?height=800&width=450&text=Curl+Definition',
    caption: 'My curls and skin have never looked better',
    author: '@curlygirl',
    productName: 'Curl Defining Cream',
    productPrice: 28.0,
    productLink: '/product/6',
  },
  {
    id: '8',
    videoUrl:
      '/videos/social-media-showcase/1759530412952_wid_NjhlMDRkYWM3NjE4MTA5ZmQ0MzdmMGZk_h264cmobile.mp4',
    thumbnailUrl: '/placeholder.svg?height=800&width=450&text=Curl+Definition',
    caption: 'My curls and skin have never looked better',
    author: '@curlygirl',
    productName: 'Curl Defining Cream',
    productPrice: 28.0,
    productLink: '/product/6',
  },
];
