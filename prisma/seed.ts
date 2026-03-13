import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The master list provided by the platform architects
const UNIVERSITIES = [
    {
        slug: 'uoc', name: 'University of Colombo', shortName: 'UoC', city: 'Colombo 07', district: 'Colombo', gateLat: 6.9000, gateLng: 79.8600,
        faculties: [
            { slug: 'uoc-main', name: 'Main Campus (Reid Avenue, Colombo 7)', shortName: 'Main' },
            { slug: 'uoc-med', name: 'Faculty of Medicine (Kynsey Road, Colombo 8)', shortName: 'Medicine' },
            { slug: 'uoc-ind', name: 'Institute of Indigenous Medicine (Rajagiriya)', shortName: 'Indigenous Med' },
            { slug: 'uoc-tech', name: 'Faculty of Technology (Pitipana, Homagama)', shortName: 'Technology' },
            { slug: 'uoc-sp', name: 'Sri Palee Campus (Wewala, Horana)', shortName: 'Sri Palee' },
            { slug: 'uoc-agro', name: 'Institute of Agro-Technology (Weligatta, Hambantota)', shortName: 'Agro-Tech' },
        ]
    },
    {
        slug: 'pera', name: 'University of Peradeniya', shortName: 'UoP', city: 'Peradeniya', district: 'Kandy', gateLat: 7.2545, gateLng: 80.5975,
        faculties: [
            { slug: 'pera-main', name: 'Main Campus (Peradeniya)', shortName: 'Main' },
            { slug: 'pera-agri', name: 'Faculty of Agriculture (Mahailluppallama)', shortName: 'Agriculture' },
        ]
    },
    {
        slug: 'usj', name: 'University of Sri Jayewardenepura', shortName: 'USJ', city: 'Nugegoda', district: 'Colombo', gateLat: 6.8528, gateLng: 79.9036,
        faculties: [
            { slug: 'usj-main', name: 'Main Campus (Gangodawila, Nugegoda)', shortName: 'Main' },
            { slug: 'usj-eng-new', name: 'Faculty of Engineering (Polgasowita)', shortName: 'Engineering' },
            { slug: 'usj-eng-old', name: 'Faculty of Engineering (Dehiwala-Mount Lavinia)', shortName: 'Engineering (Old)' },
            { slug: 'usj-tech', name: 'Faculty of Technology (Dampe-Pitipana, Homagama)', shortName: 'Technology' },
            { slug: 'usj-comp', name: 'Faculty of Computing (Pitipana, Homagama)', shortName: 'Computing' },
            { slug: 'usj-ahs', name: 'Faculty of Allied Health Sciences (Werahera)', shortName: 'Allied Health' },
            { slug: 'usj-pim', name: 'Postgraduate Institute of Management (Colombo 8)', shortName: 'PIM' },
        ]
    },
    {
        slug: 'kln', name: 'University of Kelaniya', shortName: 'UoK', city: 'Kelaniya', district: 'Gampaha', gateLat: 6.9735, gateLng: 79.9150,
        faculties: [
            { slug: 'kln-main', name: 'Main Campus (Dalugama, Kelaniya)', shortName: 'Main' },
            { slug: 'kln-med', name: 'Faculty of Medicine (Ragama)', shortName: 'Medicine' },
            { slug: 'kln-comp', name: 'Faculty of Computing & Technology (Peliyagoda)', shortName: 'Computing & Tech' },
            { slug: 'kln-arch', name: 'PG Institute of Archaeology (Colombo 7)', shortName: 'Archaeology' },
            { slug: 'kln-pali', name: 'PG Institute of Pali & Buddhist Studies (Colombo 6)', shortName: 'Pali & Buddhist' },
        ]
    },
    {
        slug: 'uom', name: 'University of Moratuwa', shortName: 'UoM', city: 'Moratuwa', district: 'Colombo', gateLat: 6.7969, gateLng: 79.9003,
        faculties: [
            { slug: 'uom-main', name: 'Main Campus (Katubedda, Moratuwa)', shortName: 'Main' },
            { slug: 'uom-itum', name: 'Institute of Technology - ITUM (Diyagama, Homagama)', shortName: 'ITUM' },
        ]
    },
    {
        slug: 'uoj', name: 'University of Jaffna', shortName: 'UoJ', city: 'Jaffna', district: 'Jaffna', gateLat: 9.6848, gateLng: 80.0217,
        faculties: [
            { slug: 'uoj-main', name: 'Main Campus (Thirunelvely)', shortName: 'Main' },
            { slug: 'uoj-agri', name: 'Agriculture & Engineering (Ariviyal Nagar, Kilinochchi)', shortName: 'Agri & Eng' },
            { slug: 'uoj-sid', name: 'Unit of Siddha Medicine (Kaithady)', shortName: 'Siddha Med' },
            { slug: 'uoj-fine', name: 'Ramanathan Academy of Fine Arts (Maruthanarmadam)', shortName: 'Fine Arts' },
        ]
    },
    {
        slug: 'ruh', name: 'University of Ruhuna', shortName: 'UoR', city: 'Matara', district: 'Matara', gateLat: 5.9381, gateLng: 80.5760,
        faculties: [
            { slug: 'ruh-main', name: 'Main Campus (Wellamadama, Matara)', shortName: 'Main' },
            { slug: 'ruh-eng', name: 'Faculty of Engineering (Hapugala, Galle)', shortName: 'Engineering' },
            { slug: 'ruh-med', name: 'Medicine & Allied Health (Karapitiya, Galle)', shortName: 'Medicine' },
            { slug: 'ruh-agri', name: 'Faculty of Agriculture (Mapalana, Kamburupitiya)', shortName: 'Agriculture' },
            { slug: 'ruh-tech', name: 'Faculty of Technology (Karagoda Uyangoda)', shortName: 'Technology' },
        ]
    },
    {
        slug: 'esn', name: 'Eastern University', shortName: 'EUSL', city: 'Batticaloa', district: 'Batticaloa', gateLat: 7.7944, gateLng: 81.5790,
        faculties: [
            { slug: 'esn-main', name: 'Main Campus (Vantharumoolai, Batticaloa)', shortName: 'Main' },
            { slug: 'esn-med', name: 'Faculty of Health-Care Sciences (Batticaloa Town)', shortName: 'Health-Care' },
            { slug: 'esn-vip', name: 'Swami Vipulananda Institute (Kallady)', shortName: 'Vipulananda' },
            { slug: 'esn-trin', name: 'Trincomalee Campus (Konesapuri)', shortName: 'Trinco Campus' },
        ]
    },
    {
        slug: 'raj', name: 'Rajarata University', shortName: 'RUSL', city: 'Mihintale', district: 'Anuradhapura', gateLat: 8.3615, gateLng: 80.5042,
        faculties: [
            { slug: 'raj-main', name: 'Main Campus (Mihintale)', shortName: 'Main' },
            { slug: 'raj-med', name: 'Medicine & Allied Sciences (Saliyapura)', shortName: 'Medicine' },
            { slug: 'raj-agri', name: 'Faculty of Agriculture (Puliyankulama)', shortName: 'Agriculture' },
        ]
    },
    {
        slug: 'wyb', name: 'Wayamba University', shortName: 'WUSL', city: 'Kuliyapitiya', district: 'Kurunegala', gateLat: 7.4688, gateLng: 80.0385,
        faculties: [
            { slug: 'wyb-main', name: 'Main Campus (Kanadulla, Kuliyapitiya)', shortName: 'Main' },
            { slug: 'wyb-med', name: 'Faculty of Medicine (Labuyaya)', shortName: 'Medicine' },
            { slug: 'wyb-mak', name: 'Agriculture & Nutrition (Makandura)', shortName: 'Agri & Nutrition' },
        ]
    },
    {
        slug: 'sab', name: 'Sabaragamuwa University', shortName: 'SUSL', city: 'Belihuloya', district: 'Ratnapura', gateLat: 6.7146, gateLng: 80.7872,
        faculties: [
            { slug: 'sab-main', name: 'Main Campus (Belihuloya)', shortName: 'Main' },
            { slug: 'sab-med', name: 'Faculty of Medicine (New Town, Ratnapura)', shortName: 'Medicine' },
        ]
    },
    {
        slug: 'seu', name: 'South Eastern University', shortName: 'SEUSL', city: 'Oluvil', district: 'Ampara', gateLat: 7.2975, gateLng: 81.8500,
        faculties: [
            { slug: 'seu-main', name: 'Main Campus (Oluvil, Ampara)', shortName: 'Main' },
            { slug: 'seu-app', name: 'Faculty of Applied Sciences (Sammanthurai)', shortName: 'Applied Sciences' },
        ]
    },
    {
        slug: 'ousl', name: 'Open University of Sri Lanka', shortName: 'OUSL', city: 'Nawala', district: 'Colombo', gateLat: 6.8833, gateLng: 79.8833,
        faculties: [{ slug: 'ousl-main', name: 'Main Campus (Nawala, Nugegoda)', shortName: 'Main' }]
    },
    {
        slug: 'uwu', name: 'Uva Wellassa University', shortName: 'UWU', city: 'Badulla', district: 'Badulla', gateLat: 6.9819, gateLng: 81.0763,
        faculties: [{ slug: 'uwu-main', name: 'Main Campus (Badulla)', shortName: 'Main' }]
    },
    {
        slug: 'vav', name: 'University of Vavuniya', shortName: 'UoV', city: 'Vavuniya', district: 'Vavuniya', gateLat: 8.7514, gateLng: 80.4971,
        faculties: [{ slug: 'vav-main', name: 'Main Campus (Pambaimadhu)', shortName: 'Main' }]
    },
    {
        slug: 'gwu', name: 'Gampaha Wickramarachchi University', shortName: 'GWUAI', city: 'Yakkala', district: 'Gampaha', gateLat: 7.0911, gateLng: 80.0072,
        faculties: [{ slug: 'gwu-main', name: 'Main Campus (Yakkala)', shortName: 'Main' }]
    },
    {
        slug: 'vpa', name: 'University of the Visual & Performing Arts', shortName: 'UVPA', city: 'Colombo 07', district: 'Colombo', gateLat: 6.9056, gateLng: 79.8681,
        faculties: [{ slug: 'vpa-main', name: 'Main Campus (Colombo 7)', shortName: 'Main' }]
    },
    // Private Institutions
    { slug: 'kdu', name: 'General Sir John Kotelawala Defence University', shortName: 'KDU', city: 'Ratmalana', district: 'Colombo', gateLat: 6.8172, gateLng: 79.8886, faculties: [{ slug: 'kdu-main', name: 'Main Campus (Ratmalana)', shortName: 'Main' }] },
    { slug: 'sliit', name: 'Sri Lanka Institute of Information Technology', shortName: 'SLIIT', city: 'Malabe', district: 'Colombo', gateLat: 6.9147, gateLng: 79.9733, faculties: [{ slug: 'sliit-main', name: 'Main Campus (Malabe)', shortName: 'Main' }] },
    { slug: 'horizon', name: 'Horizon Campus', shortName: 'Horizon', city: 'Malabe', district: 'Colombo', gateLat: 6.9140, gateLng: 79.9700, faculties: [{ slug: 'horizon-main', name: 'Main Campus (Malabe)', shortName: 'Main' }] },
    { slug: 'cinec', name: 'CINEC Campus', shortName: 'CINEC', city: 'Malabe', district: 'Colombo', gateLat: 6.9200, gateLng: 79.9730, faculties: [{ slug: 'cinec-main', name: 'Main Campus (Malabe)', shortName: 'Main' }] },
    { slug: 'sltc', name: 'SLTC Research University', shortName: 'SLTC', city: 'Padukka', district: 'Colombo', gateLat: 6.8400, gateLng: 80.0900, faculties: [{ slug: 'sltc-main', name: 'Main Campus (Padukka)', shortName: 'Main' }] },
    { slug: 'nibm', name: 'National Institute of Business Management', shortName: 'NIBM', city: 'Colombo 07', district: 'Colombo', gateLat: 6.9050, gateLng: 79.8650, faculties: [{ slug: 'nibm-main', name: 'Main Campus (Colombo 07)', shortName: 'Main' }] },
    { slug: 'nsbm', name: 'NSBM Green University', shortName: 'NSBM', city: 'Homagama', district: 'Colombo', gateLat: 6.8242, gateLng: 80.0386, faculties: [{ slug: 'nsbm-main', name: 'Main Campus (Pitipana, Homagama)', shortName: 'Main' }] },
    { slug: 'icbt', name: 'International College of Business & Technology', shortName: 'ICBT', city: 'Colombo 04', district: 'Colombo', gateLat: 6.8900, gateLng: 79.8550, faculties: [{ slug: 'icbt-main', name: 'Main Campus (Colombo 04)', shortName: 'Main' }] },
    { slug: 'iit', name: 'Informatics Institute of Technology', shortName: 'IIT', city: 'Colombo 06', district: 'Colombo', gateLat: 6.8744, gateLng: 79.8605, faculties: [{ slug: 'iit-main', name: 'Main Campus (Colombo 06)', shortName: 'Main' }] },
];

const AMENITIES = [
    { name: 'Wi-Fi', icon: 'wifi', category: 'Utilities' },
    { name: 'Air Conditioning', icon: 'snowflake', category: 'Utilities' },
    { name: 'Generator / UPS', icon: 'zap', category: 'Utilities' },
    { name: 'Hot Water', icon: 'thermometer', category: 'Utilities' },
    { name: 'Study Room', icon: 'book-open', category: 'Facilities' },
    { name: 'Common Room / TV Area', icon: 'tv', category: 'Facilities' },
    { name: 'Laundry', icon: 'washing-machine', category: 'Facilities' },
    { name: 'Bicycle Parking', icon: 'bike', category: 'Facilities' },
    { name: 'Motorbike Parking', icon: 'motorcycle', category: 'Facilities' },
    { name: 'Car Parking', icon: 'car', category: 'Facilities' },
    { name: 'CCTV', icon: 'camera', category: 'Security' },
    { name: 'Gated Compound', icon: 'shield-check', category: 'Security' },
    { name: 'Security Guard', icon: 'user-check', category: 'Security' },
];

async function main() {
    console.log('Starting seed...');

    // 1. Seed Universities and Faculties
    let uniCount = 0;
    let facultyCount = 0;

    for (const uni of UNIVERSITIES) {
        const { faculties, ...uniData } = uni;

        const createdUni = await prisma.university.upsert({
            where: { slug: uniData.slug },
            update: uniData,
            create: { ...uniData, isActive: true },
        });
        uniCount++;

        for (const fac of faculties) {
            await prisma.faculty.upsert({
                where: { slug: fac.slug },
                update: { name: fac.name, shortName: fac.shortName, universityId: createdUni.id },
                create: { ...fac, universityId: createdUni.id },
            });
            facultyCount++;
        }
    }

    // 2. Seed Amenities
    let amenityCount = 0;
    for (const amenity of AMENITIES) {
        await prisma.amenity.upsert({
            where: { name: amenity.name },
            update: amenity,
            create: amenity,
        });
        amenityCount++;
    }

    console.log(`✅ Seeded ${uniCount} universities, ${facultyCount} faculties, and ${amenityCount} amenities.`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });