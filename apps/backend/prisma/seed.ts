import { PrismaClient, RFQStatus, QuoteStatus, POStatus, DeliveryStatus, MandateStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive dummy data...');

  // Check if data already exists
  const existingCompany = await prisma.company.findUnique({
    where: { email: 'info@demomanufacturing.com' },
  });

  if (existingCompany) {
    console.log('⚠️ Database already seeded. Clearing old data and re-seeding...');
    
    // Clear existing data in correct order (respecting foreign keys)
    await prisma.auditLog.deleteMany({});
    await prisma.mandate.deleteMany({});
    await prisma.delivery.deleteMany({});
    await prisma.pOLineItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.rFQVendor.deleteMany({});
    await prisma.rFQItem.deleteMany({});
    await prisma.rFQ.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    
    console.log('✅ Cleared existing data');
  }

  // ===========================
  // 1️⃣ CREATE COMPANY
  // ===========================
  const company = await prisma.company.create({
    data: {
      name: 'Demo Manufacturing Ltd',
      email: 'info@demomanufacturing.com',
      phone: '+91 9876543210',
      gstin: '29ABCDE1234F1Z5',
      address: '123 Industrial Area, Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
  });
  console.log('✅ Created company:', company.name);

  // ===========================
  // 2️⃣ CREATE USERS
  // ===========================
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartprocure.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'OWNER',
      phone: '+91 9876543210',
      companyId: company.id,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: 'finance@smartprocure.com',
      password: hashedPassword,
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'ADMIN',
      phone: '+91 9876543211',
      companyId: company.id,
    },
  });

  const storeManager = await prisma.user.create({
    data: {
      email: 'store@smartprocure.com',
      password: hashedPassword,
      firstName: 'Store',
      lastName: 'Manager',
      role: 'USER',
      phone: '+91 9876543212',
      companyId: company.id,
    },
  });

  console.log('✅ Created 3 users (admin, finance, store)');

  // ===========================
  // 3️⃣ CREATE VENDORS (From dummy data)
  // ===========================
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Shree Steel Traders',
      email: 'shreesteel@gmail.com',
      phone: '9876543210',
      gstin: '27ABCDE1234F1Z5',
      address: '15 Steel Market, Bhosari',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411026',
      contactPerson: 'Ramesh Patil',
      materialsSupplied: ['Steel', 'TMT Bars', 'Iron'],
      vendorScore: 4.3,
      companyId: company.id,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Mahavir Electricals',
      email: 'mahavir.elec@gmail.com',
      phone: '9898989898',
      gstin: '27PQRSX5678K1Z2',
      address: '42 Lamington Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400007',
      contactPerson: 'Ajay Shah',
      materialsSupplied: ['Copper Wire', 'Electrical', 'Cables'],
      vendorScore: 4.6,
      companyId: company.id,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      name: 'Om Industrial Supplies',
      email: 'omindustrial@gmail.com',
      phone: '9123456780',
      gstin: '27LMNOP9876R1Z9',
      address: 'MIDC Industrial Area',
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422010',
      contactPerson: 'Suresh Kale',
      materialsSupplied: ['Paints', 'Chemicals', 'Safety Equipment'],
      vendorScore: 3.9,
      companyId: company.id,
    },
  });

  console.log('✅ Created 3 vendors');

  // ===========================
  // 4️⃣ CREATE ITEMS (From dummy data)
  // ===========================
  const item1 = await prisma.item.create({
    data: {
      name: 'TMT Steel Bar 12mm',
      description: 'High-strength TMT steel bar 12mm diameter, Fe-500 grade',
      category: 'Raw Material',
      unit: 'KG',
      hsn: '7214',
      defaultGst: 18,
      companyId: company.id,
    },
  });

  const item2 = await prisma.item.create({
    data: {
      name: 'Copper Wire 2.5 sqmm',
      description: 'Copper electrical wire 2.5 sq mm, ISI certified',
      category: 'Electrical',
      unit: 'Meter',
      hsn: '8544',
      defaultGst: 18,
      companyId: company.id,
    },
  });

  const item3 = await prisma.item.create({
    data: {
      name: 'Industrial Paint Red',
      description: 'Industrial grade enamel paint, red color, rust resistant',
      category: 'Chemicals',
      unit: 'Litre',
      hsn: '3208',
      defaultGst: 18,
      companyId: company.id,
    },
  });

  const item4 = await prisma.item.create({
    data: {
      name: 'Safety Helmet',
      description: 'Industrial safety helmet with chin strap, ISI marked',
      category: 'Safety',
      unit: 'Piece',
      hsn: '6506',
      defaultGst: 18,
      companyId: company.id,
    },
  });

  console.log('✅ Created 4 items');

  // ===========================
  // 5️⃣ CREATE RFQs
  // ===========================
  const rfq1 = await prisma.rFQ.create({
    data: {
      rfqNumber: 'RFQ-2025-001',
      title: 'Steel and Safety Equipment for Q1',
      description: 'Procurement of TMT steel bars and safety helmets for January projects',
      status: RFQStatus.COMPLETED,
      dueDate: new Date('2025-01-10'),
      createdById: adminUser.id,
      companyId: company.id,
    },
  });

  const rfq2 = await prisma.rFQ.create({
    data: {
      rfqNumber: 'RFQ-2025-002',
      title: 'Electrical and Paint Supplies',
      description: 'Copper wiring and industrial paints for factory maintenance',
      status: RFQStatus.IN_PROGRESS,
      dueDate: new Date('2025-01-20'),
      createdById: adminUser.id,
      companyId: company.id,
    },
  });

  console.log('✅ Created 2 RFQs');

  // ===========================
  // 6️⃣ CREATE RFQ ITEMS
  // ===========================
  await prisma.rFQItem.createMany({
    data: [
      { rfqId: rfq1.id, itemId: item1.id, quantity: 1000, notes: 'Urgent requirement' },
      { rfqId: rfq1.id, itemId: item4.id, quantity: 50, notes: 'Blue color preferred' },
      { rfqId: rfq2.id, itemId: item2.id, quantity: 500, notes: 'Standard grade' },
      { rfqId: rfq2.id, itemId: item3.id, quantity: 100, notes: 'Bright red shade' },
    ],
  });

  console.log('✅ Created RFQ line items');

  // ===========================
  // 7️⃣ CREATE RFQ VENDORS (Which vendors received the RFQ)
  // ===========================
  await prisma.rFQVendor.createMany({
    data: [
      { rfqId: rfq1.id, vendorId: vendor1.id, sentAt: new Date('2025-01-05'), viewedAt: new Date('2025-01-05') },
      { rfqId: rfq1.id, vendorId: vendor3.id, sentAt: new Date('2025-01-05'), viewedAt: new Date('2025-01-06') },
      { rfqId: rfq2.id, vendorId: vendor2.id, sentAt: new Date('2025-01-12'), viewedAt: new Date('2025-01-12') },
      { rfqId: rfq2.id, vendorId: vendor1.id, sentAt: new Date('2025-01-12'), viewedAt: new Date('2025-01-13') },
    ],
  });

  console.log('✅ Created RFQ vendor assignments');

  // ===========================
  // 8️⃣ CREATE QUOTES
  // ===========================
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: 'QT-2025-001',
      rfqId: rfq1.id,
      vendorId: vendor1.id,
      basePrice: 72000,
      gst: 18,
      gstAmount: 12960,
      transportCost: 3000,
      landedCost: 87960,
      deliveryDays: 7,
      terms: 'Net 30 days',
      notes: 'Best price for bulk order',
      status: QuoteStatus.APPROVED,
      isApproved: true,
      approvedAt: new Date('2025-01-06'),
    },
  });

  const quote2 = await prisma.quote.create({
    data: {
      quoteNumber: 'QT-2025-002',
      rfqId: rfq1.id,
      vendorId: vendor3.id,
      basePrice: 76000,
      gst: 18,
      gstAmount: 13680,
      transportCost: 3500,
      landedCost: 93180,
      deliveryDays: 10,
      terms: 'Net 15 days',
      notes: 'Price includes loading',
      status: QuoteStatus.REJECTED,
      isApproved: false,
    },
  });

  const quote3 = await prisma.quote.create({
    data: {
      quoteNumber: 'QT-2025-003',
      rfqId: rfq2.id,
      vendorId: vendor2.id,
      basePrice: 95000,
      gst: 18,
      gstAmount: 17100,
      transportCost: 2500,
      landedCost: 114600,
      deliveryDays: 5,
      terms: 'Net 30 days',
      notes: 'Express delivery available',
      status: QuoteStatus.APPROVED,
      isApproved: true,
      approvedAt: new Date('2025-01-14'),
    },
  });

  const quote4 = await prisma.quote.create({
    data: {
      quoteNumber: 'QT-2025-004',
      rfqId: rfq2.id,
      vendorId: vendor1.id,
      basePrice: 98000,
      gst: 18,
      gstAmount: 17640,
      transportCost: 3000,
      landedCost: 118640,
      deliveryDays: 8,
      terms: 'Net 45 days',
      status: QuoteStatus.REJECTED,
      isApproved: false,
    },
  });

  console.log('✅ Created 4 quotes');

  // ===========================
  // 9️⃣ CREATE PURCHASE ORDERS
  // ===========================
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2025-001',
      quoteId: quote1.id,
      vendorId: vendor1.id,
      companyId: company.id,
      createdById: adminUser.id,
      totalAmount: 72000,
      gstAmount: 12960,
      grandTotal: 87960,
      status: POStatus.DELIVERED,
      terms: 'Payment within 30 days of delivery',
      paymentTerms: 'Net 30',
      deliveryAddress: '123 Industrial Area, Phase 2, Mumbai',
      expectedDeliveryDate: new Date('2025-01-14'),
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2025-002',
      quoteId: quote3.id,
      vendorId: vendor2.id,
      companyId: company.id,
      createdById: adminUser.id,
      totalAmount: 95000,
      gstAmount: 17100,
      grandTotal: 114600,
      status: POStatus.IN_PROGRESS,
      terms: 'Payment within 30 days of delivery',
      paymentTerms: 'Net 30',
      deliveryAddress: '123 Industrial Area, Phase 2, Mumbai',
      expectedDeliveryDate: new Date('2025-01-22'),
    },
  });

  console.log('✅ Created 2 purchase orders');

  // ===========================
  // 🔟 CREATE PO LINE ITEMS
  // ===========================
  await prisma.pOLineItem.createMany({
    data: [
      {
        poId: po1.id,
        itemId: item1.id,
        quantity: 1000,
        unitPrice: 72,
        gst: 18,
        gstAmount: 12960,
        totalAmount: 84960,
      },
      {
        poId: po1.id,
        itemId: item4.id,
        quantity: 50,
        unitPrice: 60,
        gst: 18,
        gstAmount: 540,
        totalAmount: 3540,
      },
      {
        poId: po2.id,
        itemId: item2.id,
        quantity: 500,
        unitPrice: 110,
        gst: 18,
        gstAmount: 9900,
        totalAmount: 64900,
      },
      {
        poId: po2.id,
        itemId: item3.id,
        quantity: 100,
        unitPrice: 180,
        gst: 18,
        gstAmount: 3240,
        totalAmount: 21240,
      },
    ],
  });

  console.log('✅ Created PO line items');

  // ===========================
  // 1️⃣1️⃣ CREATE DELIVERIES
  // ===========================
  const delivery1 = await prisma.delivery.create({
    data: {
      poId: po1.id,
      vendorId: vendor1.id,
      deliveryNumber: 'DEL-2025-001',
      deliveryDate: new Date('2025-01-10'),
      receivedDate: new Date('2025-01-10'),
      status: DeliveryStatus.DELIVERED,
      notes: 'Full quantity received in good condition',
      receivedBy: 'Store Manager',
    },
  });

  const delivery2 = await prisma.delivery.create({
    data: {
      poId: po2.id,
      vendorId: vendor2.id,
      deliveryNumber: 'DEL-2025-002',
      deliveryDate: new Date('2025-01-20'),
      status: DeliveryStatus.PARTIALLY_DELIVERED,
      notes: 'Copper wire delivered, paint pending',
      receivedBy: 'Site Engineer',
    },
  });

  console.log('✅ Created 2 deliveries');

  // ===========================
  // 1️⃣2️⃣ CREATE MANDATES (Payment Agreements)
  // ===========================
  const mandate1 = await prisma.mandate.create({
    data: {
      mandateNumber: 'MND-2025-001',
      poId: po1.id,
      vendorId: vendor1.id,
      companyId: company.id,
      totalAmount: 87960,
      dueDate: new Date('2025-02-10'),
      installments: 1,
      installmentAmount: 87960,
      mandateStatus: MandateStatus.COMPLETED,
      terms: 'Single payment upon delivery verification',
      bankDetails: JSON.stringify({
        bankName: 'SBI',
        accountNo: '12345678901',
        ifscCode: 'SBIN0000456',
        accountHolder: 'Shree Steel Traders',
      }),
      signedByVendorAt: new Date('2025-01-11'),
      signedByCompanyAt: new Date('2025-01-12'),
      vendorSignature: 'vendor_signature_001.png',
      companySignature: 'company_signature_001.png',
      executedAt: new Date('2025-01-12'),
    },
  });

  const mandate2 = await prisma.mandate.create({
    data: {
      mandateNumber: 'MND-2025-002',
      poId: po2.id,
      vendorId: vendor2.id,
      companyId: company.id,
      totalAmount: 114600,
      dueDate: new Date('2025-02-20'),
      installments: 2,
      installmentAmount: 57300,
      mandateStatus: MandateStatus.PENDING,
      terms: 'Two installments - 50% on delivery, 50% after 30 days',
      bankDetails: JSON.stringify({
        bankName: 'HDFC',
        accountNo: '98765432109',
        ifscCode: 'HDFC0001234',
        accountHolder: 'Mahavir Electricals',
      }),
    },
  });

  console.log('✅ Created 2 mandates');

  // ===========================
  // 1️⃣3️⃣ CREATE AUDIT LOGS
  // ===========================
  await prisma.auditLog.createMany({
    data: [
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'CREATE_RFQ',
        entity: 'RFQ',
        entityId: rfq1.id,
        metadata: JSON.stringify({ rfqNumber: 'RFQ-2025-001', title: 'Steel and Safety Equipment for Q1' }),
        createdAt: new Date('2025-01-05 10:15:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'APPROVE_QUOTE',
        entity: 'Quote',
        entityId: quote1.id,
        metadata: JSON.stringify({ quoteNumber: 'QT-2025-001', status: 'APPROVED' }),
        createdAt: new Date('2025-01-06 17:45:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'CREATE_PO',
        entity: 'PurchaseOrder',
        entityId: po1.id,
        metadata: JSON.stringify({ poNumber: 'PO-2025-001', grandTotal: 87960 }),
        createdAt: new Date('2025-01-07 09:30:00'),
      },
      {
        companyId: company.id,
        userId: storeManager.id,
        action: 'RECEIVE_DELIVERY',
        entity: 'Delivery',
        entityId: delivery1.id,
        metadata: JSON.stringify({ deliveryNumber: 'DEL-2025-001', status: 'DELIVERED' }),
        createdAt: new Date('2025-01-10 14:20:00'),
      },
      {
        companyId: company.id,
        userId: financeUser.id,
        action: 'EXECUTE_MANDATE',
        entity: 'Mandate',
        entityId: mandate1.id,
        metadata: JSON.stringify({ mandateNumber: 'MND-2025-001', status: 'COMPLETED' }),
        createdAt: new Date('2025-01-12 11:00:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'CREATE_RFQ',
        entity: 'RFQ',
        entityId: rfq2.id,
        metadata: JSON.stringify({ rfqNumber: 'RFQ-2025-002', title: 'Electrical and Paint Supplies' }),
        createdAt: new Date('2025-01-12 10:00:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'APPROVE_QUOTE',
        entity: 'Quote',
        entityId: quote3.id,
        metadata: JSON.stringify({ quoteNumber: 'QT-2025-003', status: 'APPROVED' }),
        createdAt: new Date('2025-01-14 16:30:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        action: 'CREATE_PO',
        entity: 'PurchaseOrder',
        entityId: po2.id,
        metadata: JSON.stringify({ poNumber: 'PO-2025-002', grandTotal: 114600 }),
        createdAt: new Date('2025-01-15 10:00:00'),
      },
    ],
  });

  console.log('✅ Created 8 audit log entries');

  // ===========================
  // 1️⃣4️⃣ CREATE NOTIFICATIONS
  // ===========================
  await prisma.notification.createMany({
    data: [
      {
        companyId: company.id,
        userId: adminUser.id,
        type: 'DELIVERY_UPDATE',
        title: 'PO Delivered Successfully',
        message: 'Purchase Order PO-2025-001 has been delivered by Shree Steel Traders',
        isRead: true,
        createdAt: new Date('2025-01-10 14:25:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        type: 'MANDATE_SIGNED',
        title: 'Payment Completed',
        message: 'Mandate MND-2025-001 for ₹87,960 has been executed',
        isRead: true,
        createdAt: new Date('2025-01-12 11:05:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        type: 'QUOTE_SUBMITTED',
        title: 'New Quote Received',
        message: 'Mahavir Electricals submitted quote QT-2025-003 for RFQ-2025-002',
        isRead: false,
        createdAt: new Date('2025-01-14 10:00:00'),
      },
      {
        companyId: company.id,
        userId: adminUser.id,
        type: 'DELIVERY_UPDATE',
        title: 'Partial Delivery Received',
        message: 'PO-2025-002: Copper wire delivered, paint shipment pending',
        isRead: false,
        createdAt: new Date('2025-01-20 15:00:00'),
      },
      {
        companyId: company.id,
        userId: financeUser.id,
        type: 'PAYMENT_DUE',
        title: 'Mandate Awaiting Signature',
        message: 'Mandate MND-2025-002 for ₹1,14,600 is pending vendor signature',
        isRead: false,
        createdAt: new Date('2025-01-20 16:00:00'),
      },
    ],
  });

  console.log('✅ Created 5 notifications');

  // ===========================
  // SUMMARY
  // ===========================
  console.log('\n🎉 ============================================');
  console.log('   DATABASE SEEDED SUCCESSFULLY!');
  console.log('   ============================================');
  console.log('\n📊 Data Summary:');
  console.log('   • 1 Company');
  console.log('   • 3 Users (admin, finance, store)');
  console.log('   • 3 Vendors');
  console.log('   • 4 Items');
  console.log('   • 2 RFQs with line items');
  console.log('   • 4 Quotes (2 approved, 2 rejected)');
  console.log('   • 2 Purchase Orders');
  console.log('   • 2 Deliveries');
  console.log('   • 2 Mandates');
  console.log('   • 8 Audit logs');
  console.log('   • 5 Notifications');
  console.log('\n💰 Financial Summary:');
  console.log('   • PO-2025-001: ₹87,960 (DELIVERED & PAID)');
  console.log('   • PO-2025-002: ₹1,14,600 (IN PROGRESS)');
  console.log('   • Total Value: ₹2,02,560');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@smartprocure.com');
  console.log('   Password: Admin@123');
  console.log('\n   Additional users:');
  console.log('   • finance@smartprocure.com / Admin@123');
  console.log('   • store@smartprocure.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
