import {
  validateContact,
  contactFromProfile,
  baseRfqCode,
  nextRfqCode,
  buildRfqPayload,
  summarizeRfq,
  RfqContact,
  RFQ_DISCLAIMER,
} from '../lib/rfq';
import { Project, UserProfile } from '../types';
import { PRODUCT_CATALOG } from '../lib/catalog';

describe('rfq', () => {
  const downlight = PRODUCT_CATALOG.find((p) => p.sku === 'QLS-DL90-12W-3K')!;

  const validContact: RfqContact = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+61 400 123 456',
    companyName: 'Studio Arch',
    buyerType: 'architect',
    channel: 'email',
    notes: 'Please quote delivery to Sydney.',
  };

  test('validateContact returns errors for invalid inputs', () => {
    const invalid: RfqContact = {
      fullName: 'J',
      email: 'not-an-email',
      phone: '123',
      buyerType: 'architect',
      channel: 'email',
    };
    const errors = validateContact(invalid);
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  test('validateContact returns empty object for valid input', () => {
    const errors = validateContact(validContact);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('contactFromProfile fills defaults and maps userProfile', () => {
    const profile: UserProfile = {
      id: 'u1',
      fullName: 'Alice Smith',
      email: 'alice@test.com',
      phone: '0412345678',
      companyName: 'Alice Design',
      userType: 'designer',
    };
    const contact = contactFromProfile(profile);
    expect(contact.fullName).toBe('Alice Smith');
    expect(contact.email).toBe('alice@test.com');
    expect(contact.phone).toBe('0412345678');
    expect(contact.buyerType).toBe('designer');
  });

  test('baseRfqCode and nextRfqCode revision progression', () => {
    const projectId = 'proj-99a-b8c';
    const base = baseRfqCode(projectId);
    expect(base).toMatch(/^RFQ-[A-Z0-9]{6}$/);

    const code1 = nextRfqCode({ id: projectId });
    expect(code1).toBe(base);

    const code2 = nextRfqCode({ id: projectId, rfqCode: code1 });
    expect(code2).toBe(`${base}-R2`);

    const code3 = nextRfqCode({ id: projectId, rfqCode: code2 });
    expect(code3).toBe(`${base}-R3`);
  });

  test('buildRfqPayload and summarizeRfq', () => {
    const project: Project = {
      id: 'proj-123456',
      projectName: 'Coastal Residence',
      clientName: 'Dr. Jones',
      projectAddress: '123 Ocean Rd',
      status: 'draft',
      totalFixturesCount: 6,
      totalPowerWatts: 72,
      totalEstimatedCost: 720,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rooms: [
        {
          id: 'r1',
          projectId: 'proj-123456',
          name: 'Living',
          roomType: 'living_room',
          length: 6,
          width: 5,
          height: 2.8,
          targetLux: 150,
          requiredLumens: 4500,
          ceilingType: 'plasterboard',
          createdAt: new Date().toISOString(),
          selectedItem: {
            id: 'item-1',
            product: downlight,
            tierType: 'recommended',
            quantity: 6,
            selectedFinish: 'White',
            unitPrice: 120,
            subtotal: 720,
            luxAchieved: 165,
          },
        },
      ],
      additionalItems: [],
    };

    const payload = buildRfqPayload(project, validContact, 'RFQ-123456');
    expect(payload.code).toBe('RFQ-123456');
    expect(payload.disclaimer).toBe(RFQ_DISCLAIMER);
    expect(payload.spaces).toHaveLength(1);
    expect(payload.totals.pieces).toBe(6);
    expect(payload.bom).toHaveLength(1);

    const summary = summarizeRfq(payload);
    expect(summary).toContain('RFQ-123456');
    expect(summary).toContain('Coastal Residence');
    expect(summary).toContain('Jane Doe');
    expect(summary).toContain(downlight.sku);
  });
});
