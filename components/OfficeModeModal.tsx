import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useOfficeMode } from '@/lib/officeMode';

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

interface CellData {
  [key: string]: string;
}

const INITIAL_GRID: CellData = {
  'A1': 'Q3 FINANCIAL REPORT - CONFIDENTIAL',
  'A3': 'Cost Center ID', 'B3': 'Department / Project', 'C3': 'Q1 Actual ($)', 'D3': 'Q2 Actual ($)', 'E3': 'Q3 Budget ($)', 'F3': 'Variance (%)', 'G3': 'Forecast Q4 ($)', 'H3': 'Status',
  'A4': 'CC-101', 'B4': 'Enterprise Infrastructure & Ops', 'C4': '145,200', 'D4': '152,400', 'E4': '160,000', 'F4': '+4.8%', 'G4': '165,000', 'H4': 'APPROVED',
  'A5': 'CC-102', 'B5': 'Human Resources & Talent', 'C5': '84,100', 'D5': '88,900', 'E5': '92,000', 'F5': '+3.5%', 'G5': '95,000', 'H5': 'APPROVED',
  'A6': 'CC-103', 'B6': 'Corporate Compliance & Legal', 'C6': '210,000', 'D6': '215,500', 'E6': '225,000', 'F6': '+4.4%', 'G6': '230,000', 'H6': 'PENDING REVIEW',
  'A7': 'CC-104', 'B7': 'Marketing & Brand Strategy', 'C7': '320,500', 'D7': '310,000', 'E7': '340,000', 'F7': '+9.6%', 'G7': '350,000', 'H7': 'APPROVED',
  'A8': 'CC-105', 'B8': 'Research & Analytics (Project Alpha)', 'C8': '450,000', 'D8': '482,000', 'E8': '500,000', 'F8': '+3.7%', 'G8': '520,000', 'H8': 'APPROVED',
  'A9': 'CC-106', 'B9': 'Security Audit & Zero-Trust Architecture', 'C9': '195,000', 'D9': '198,200', 'E9': '210,000', 'F9': '+5.9%', 'G9': '215,000', 'H9': 'APPROVED',
  'A10': 'CC-107', 'B10': 'Vendor Logistics & Supply Chain', 'C10': '112,000', 'D10': '118,400', 'E10': '125,000', 'F10': '+5.5%', 'G10': '128,000', 'H10': 'APPROVED',
  'A12': 'TOTAL EXPENDITURE', 'B12': 'Consolidated Cost Centers (A1..A10)', 'C12': '$1,516,800', 'D12': '$1,565,400', 'E12': '$1,652,000', 'F12': '+5.53%', 'G12': '$1,703,000', 'H12': 'BALANCED',
  'A14': 'KPI Summary:', 'B14': 'Operational Margin: 34.2%', 'C14': 'EBITDA: $4.1M', 'D14': 'ROI Index: 1.48',
};

export function OfficeModeModal() {
  const { active, toggle } = useOfficeMode();
  const [gridData, setGridData] = useState<CellData>(INITIAL_GRID);
  const [selectedCell, setSelectedCell] = useState('B4');
  const [formulaValue, setFormulaValue] = useState('Enterprise Infrastructure & Ops');
  const [activeTab, setActiveTab] = useState('Q3 Financial Summary');

  if (!active) return null;

  const handleCellSelect = (cellKey: string) => {
    setSelectedCell(cellKey);
    setFormulaValue(gridData[cellKey] || '');
  };

  const handleCellChange = (text: string) => {
    setFormulaValue(text);
    setGridData((prev) => ({ ...prev, [selectedCell]: text }));
  };

  return (
    <Modal visible={active} animationType="none" transparent={false}>
      <View style={styles.container}>
        {/* Excel Title Bar */}
        <View style={styles.titleBar}>
          <View style={styles.titleLeft}>
            <Text style={styles.excelIcon}>📊</Text>
            <Text style={styles.windowTitle}>
              Q3_Financial_Summary_v4_FINAL.xlsx - Excel (Modo Oficina Activo)
            </Text>
          </View>

          <View style={styles.quickSaveRow}>
            <Text style={styles.quickSaveText}>Guardado en OneDrive ✓</Text>
            <TouchableOpacity style={styles.exitBtn} onPress={() => toggle(false)}>
              <Text style={styles.exitBtnText}>✕ Salir del Modo Oficina (Esc / Alt+Shift+X)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Excel Ribbon Bar */}
        <View style={styles.ribbonBar}>
          {['Archivo', 'Inicio', 'Insertar', 'Disposición de página', 'Fórmulas', 'Datos', 'Revisar', 'Vista'].map((menu, idx) => (
            <TouchableOpacity key={idx} style={[styles.ribbonTab, idx === 1 && styles.ribbonTabActive]}>
              <Text style={[styles.ribbonTabText, idx === 1 && styles.ribbonTabTextActive]}>{menu}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Excel Toolbar Action Row */}
        <View style={styles.toolbarRow}>
          <Text style={styles.toolBtn}>✂️ Cortar</Text>
          <Text style={styles.toolBtn}>📋 Copiar</Text>
          <Text style={styles.toolBtn}>🎨 Formato</Text>
          <View style={styles.toolDivider} />
          <Text style={styles.toolBtn}><b>B</b> Negrita</Text>
          <Text style={styles.toolBtn}><i>I</i> Cursiva</Text>
          <Text style={styles.toolBtn}><u>U</u> Subrayado</Text>
          <View style={styles.toolDivider} />
          <Text style={styles.toolBtn}>Σ AutoSuma</Text>
          <Text style={styles.toolBtn}>AZ↓ Ordenar</Text>
          <Text style={styles.toolBtn}>🔍 Buscar</Text>
        </View>

        {/* Formula Bar */}
        <View style={styles.formulaBar}>
          <View style={styles.nameBox}>
            <Text style={styles.nameBoxText}>{selectedCell}</Text>
          </View>
          <Text style={styles.fxSymbol}>fx</Text>
          <TextInput
            style={styles.formulaInput}
            value={formulaValue}
            onChangeText={handleCellChange}
            placeholder="Ingresar fórmula o valor (ej: =SUM(C4:C10))..."
            placeholderTextColor="#888888"
          />
        </View>

        {/* Main Spreadsheet Grid */}
        <ScrollView style={styles.gridScroll} horizontal showsHorizontalScrollIndicator>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator>
            {/* Column Headers A-K */}
            <View style={styles.row}>
              <View style={styles.cornerCell}>
                <Text style={styles.cornerCellText}>◢</Text>
              </View>
              {COLUMNS.map((col) => (
                <View key={col} style={styles.colHeaderCell}>
                  <Text style={styles.colHeaderText}>{col}</Text>
                </View>
              ))}
            </View>

            {/* Rows 1 to 30 */}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((rowNum) => (
              <View key={rowNum} style={styles.row}>
                {/* Row Header 1, 2, 3... */}
                <View style={styles.rowHeaderCell}>
                  <Text style={styles.rowHeaderText}>{rowNum}</Text>
                </View>

                {/* Cells in Row */}
                {COLUMNS.map((col) => {
                  const cellKey = `${col}${rowNum}`;
                  const isSelected = selectedCell === cellKey;
                  const val = gridData[cellKey] || '';
                  const isHeaderRow = rowNum === 3;
                  const isTotalRow = rowNum === 12;

                  return (
                    <TouchableOpacity
                      key={cellKey}
                      activeOpacity={0.9}
                      style={[
                        styles.gridCell,
                        col === 'B' && { width: 220 },
                        isSelected && styles.gridCellSelected,
                        isHeaderRow && styles.headerRowCell,
                        isTotalRow && styles.totalRowCell,
                      ]}
                      onPress={() => handleCellSelect(cellKey)}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.cellText,
                          isHeaderRow && styles.headerRowText,
                          isTotalRow && styles.totalRowText,
                          rowNum === 1 && { fontWeight: '900', color: '#107c41' },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Bottom Sheet Tabs & Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.sheetTabsRow}>
            {['Q3 Financial Summary', 'Cost Allocation', 'Audit Log (Approved)', '+'].map((tab, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.sheetTab, activeTab === tab && styles.sheetTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.sheetTabText, activeTab === tab && styles.sheetTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statusRight}>
            <Text style={styles.statusText}>LISTO | PROMEDIO: $412,800 | RECUPERO: 100%</Text>

            <TouchableOpacity style={styles.panicBtnBottom} onPress={() => toggle(false)}>
              <Text style={styles.panicBtnBottomText}>🔒 Desactivar Modo Oficina (Esc)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' ? { userSelect: 'none' } : {}),
  },

  titleBar: {
    backgroundColor: '#107c41',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  excelIcon: { fontSize: 16 },
  windowTitle: { color: '#ffffff', fontSize: 12, fontWeight: '700', fontFamily: 'sans-serif' },
  quickSaveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickSaveText: { color: '#dcfce7', fontSize: 11 },
  exitBtn: { backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  exitBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },

  ribbonBar: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingHorizontal: 8,
  },
  ribbonTab: { paddingHorizontal: 12, paddingVertical: 6 },
  ribbonTabActive: { backgroundColor: '#ffffff', borderTopWidth: 2, borderTopColor: '#107c41' },
  ribbonTabText: { color: '#374151', fontSize: 11 },
  ribbonTabTextActive: { color: '#107c41', fontWeight: '800' },

  toolbarRow: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  toolBtn: { color: '#4b5563', fontSize: 11 },
  toolDivider: { width: 1, height: 14, backgroundColor: '#d1d5db' },

  formulaBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    gap: 6,
  },
  nameBox: {
    width: 50,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  nameBoxText: { color: '#1e293b', fontSize: 11, fontWeight: '800' },
  fxSymbol: { color: '#64748b', fontSize: 12, fontWeight: '800', fontStyle: 'italic' },
  formulaInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 11,
    color: '#0f172a',
  },

  gridScroll: { flex: 1, backgroundColor: '#f8fafc' },
  row: { flexDirection: 'row' },
  cornerCell: {
    width: 36,
    height: 22,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerCellText: { fontSize: 10, color: '#64748b' },

  colHeaderCell: {
    width: 100,
    height: 22,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colHeaderText: { fontSize: 11, fontWeight: '700', color: '#334155' },

  rowHeaderCell: {
    width: 36,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHeaderText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  gridCell: {
    width: 100,
    height: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  gridCellSelected: {
    borderColor: '#107c41',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  cellText: { fontSize: 11, color: '#1e293b' },

  headerRowCell: { backgroundColor: '#f1f5f9' },
  headerRowText: { fontWeight: '800', color: '#0f172a' },
  totalRowCell: { backgroundColor: '#fef3c7' },
  totalRowText: { fontWeight: '900', color: '#92400e' },

  statusBar: {
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sheetTabsRow: { flexDirection: 'row', gap: 2 },
  sheetTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#e2e8f0',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  sheetTabActive: { backgroundColor: '#ffffff', borderTopWidth: 2, borderTopColor: '#107c41' },
  sheetTabText: { fontSize: 11, color: '#475569' },
  sheetTabTextActive: { fontWeight: '800', color: '#107c41' },

  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  panicBtnBottom: { backgroundColor: '#dc2626', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  panicBtnBottomText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
});
