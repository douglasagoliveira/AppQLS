jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

import {
  analyzeProjectPlan,
  scanSingleRoomWithAi,
  SelectedFilePayload,
} from '../services/aiVisionService';


describe('aiVisionService', () => {
  const dummyPdfFile: SelectedFilePayload = {
    uri: 'file:///data/projects/mosman-residence.pdf',
    name: 'mosman-residence.pdf',
    mimeType: 'application/pdf',
    size: 102400,
  };

  const dummyImageFile: SelectedFilePayload = {
    uri: 'file:///data/projects/kitchen-plan.jpg',
    name: 'kitchen-plan.jpg',
    mimeType: 'image/jpeg',
    size: 45000,
  };

  describe('analyzeProjectPlan', () => {
    it('processes existing lighting plan and identifies rooms and fixtures', async () => {
      const result = await analyzeProjectPlan(dummyPdfFile, 'existing_plan', false);

      expect(result.mode).toBe('existing_plan');
      expect(result.fileName).toBe('mosman-residence.pdf');
      expect(result.rooms.length).toBeGreaterThan(0);

      const kitchen = result.rooms.find((r) => r.roomType === 'kitchen');
      expect(kitchen).toBeDefined();
      expect(kitchen!.length).toBeGreaterThan(0);
      expect(kitchen!.width).toBeGreaterThan(0);
      expect(kitchen!.targetLux).toBe(300);
      expect(kitchen!.suggestedProducts.length).toBeGreaterThan(0);
      expect(kitchen!.selectedItem).toBeDefined();
      expect(kitchen!.selectedItem?.quantity).toBeGreaterThan(0);
    });

    it('processes architectural floor plan from scratch with AS/NZS 1680 compliance', async () => {
      const result = await analyzeProjectPlan(dummyPdfFile, 'architectural_from_scratch', false);

      expect(result.mode).toBe('architectural_from_scratch');
      expect(result.rooms.length).toBeGreaterThan(0);

      const living = result.rooms.find((r) => r.roomType === 'living_room');
      expect(living).toBeDefined();
      expect(living!.targetLux).toBe(160); // Standard living room lux from AS/NZS 1680
      expect(living!.calculationResult).toBeDefined();
      expect(living!.calculationResult?.totalLumensRequired).toBeGreaterThan(0);
      expect(living!.linearMeters).toBe(0);
    });

    it('includes linear LED strips when includeLinearLighting is enabled', async () => {
      const result = await analyzeProjectPlan(dummyPdfFile, 'architectural_from_scratch', true);

      const kitchen = result.rooms.find((r) => r.roomType === 'kitchen');
      expect(kitchen).toBeDefined();
      expect(kitchen!.includeLinearStrip).toBe(true);
      expect(kitchen!.linearMeters).toBeGreaterThan(0);

      const hasStripProduct = kitchen!.suggestedProducts.some((p) => p.category === 'strip');
      expect(hasStripProduct).toBe(true);
    });
  });

  describe('scanSingleRoomWithAi', () => {
    it('scans a single room file and extracts valid dimensions and room type', async () => {
      const scanned = await scanSingleRoomWithAi(dummyImageFile);

      expect(scanned.roomName).toBeTruthy();
      expect(scanned.roomType).toBeTruthy();
      expect(scanned.length).toBeGreaterThan(0);
      expect(scanned.width).toBeGreaterThan(0);
      expect(scanned.height).toBeGreaterThan(0);
    });
  });
});
