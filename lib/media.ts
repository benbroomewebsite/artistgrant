import { mediaUrl } from '@/lib/media-url'

export const judgeImages = [
  '/media/judges/selvi-may-akyildiz-a93fb2f0.jpg',
  '/media/judges/asl-baykal-0566dd56.jpg',
  '/media/judges/caroline-bourgeois-8e363f6b.jpg',
  '/media/judges/jace-clayton-ba0721d2.png',
  '/media/judges/racheal-crowther-70ebe4f2.jpg',
  '/media/judges/nat-faulkner-c1e877ca.jpg',
  '/media/judges/david-l-johnson-f09e2851.jpg',
  '/media/judges/jessi-reaves-bbe6717d.jpg',
  '/media/judges/p-staff-2cdfdde0.png',
  '/media/judges/christopher-kulendran-thomas-1c89855e.jpg',
  '/media/judges/annika-kuhlmann-5faa1b07.jpg',
  '/media/judges/olamiju-fajemisin-artist-grant-2026-organiser-e0a26ede.jpg',
  '/media/judges/ben-broome-artist-grant-founder-0b75285b.jpg',
].map(mediaUrl)

export const shortlistImage = mediaUrl('/media/shortlisting/nc2026-group-014-ruth-samuels-3a00d35f.jpg')

export const winnerYears = [
  { year: '2024', cover: '/media/previouswinners-2024grant-ntd96/mg-9750-d7e86435.jpg', images: [
    '/media/previouswinners-2024grant-ntd96/image-processing20241127-2-318gdw-d5a40254.jpg',
    '/media/previouswinners-2024grant-ntd96/rat-section-announcement-ba97fdab.jpg',
    '/media/previouswinners-2024grant-ntd96/mg-9750-d7e86435.jpg',
  ] },
  { year: '2023', cover: '/media/previouswinners-2023grant/andina-1f60b61e.jpg', images: [
    '/media/previouswinners-2023grant/morgan-still-6c097205.png',
    '/media/previouswinners-2023grant/ceidra-b3bfdcbc.jpg',
    '/media/previouswinners-2023grant/andina-1f60b61e.jpg',
    '/media/previouswinners-2023grant/mati-still-df4a5140.png',
    '/media/previouswinners-2023grant/coaley-peak-a-fragment-2021-film-still-16ddb582.jpg',
  ] },
  { year: '2022', cover: '/media/previouswinners-2022grant-8clt8/11-copy-blured-1-2-ec4918b6.jpg', images: [
    '/media/previouswinners-2022grant-8clt8/artistgrant-4-33f9e48d.jpg',
    '/media/previouswinners-2022grant-8clt8/artistgrant-1-df47f5a6.jpg',
    '/media/previouswinners-2022grant-8clt8/artistgrant-2-c96a2b56.jpg',
    '/media/previouswinners-2022grant-8clt8/artistgrant-3-a535dba8.jpg',
  ] },
  { year: '2021', cover: '/media/previouswinners-2021grant-sbbp8/abdulhamid-kircher-a3faf429.jpg', images: [
    '/media/previouswinners-2021grant-sbbp8/jesus-hillario-reyes-1-570f8b35.jpg',
    '/media/previouswinners-2021grant-sbbp8/abdulhamid-kircher-a3faf429.jpg',
    '/media/previouswinners-2021grant-sbbp8/daniel-mebarek-2-da1c82c7.jpg',
  ] },
] as const
