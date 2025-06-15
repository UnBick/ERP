import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  schoolName: {
    fontSize: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
});

export const generatePDF = (reportType, data, schoolInfo) => {
  const ReportDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{schoolInfo.name}</Text>
          <Text>{schoolInfo.address}</Text>
          <Text style={styles.title}>{reportType} Report</Text>
          <Text>Generated on: {format(new Date(), 'PPP')}</Text>
        </View>

        <View style={styles.table}>
          {/* Dynamic Table Headers */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {Object.keys(data[0] || {}).map((key) => (
              <Text key={key} style={styles.tableCell}>
                {key}
              </Text>
            ))}
          </View>

          {/* Table Data */}
          {data.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              {Object.values(row).map((value, i) => (
                <Text key={i} style={styles.tableCell}>
                  {value}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>This is a computer-generated document</Text>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );

  return ReportDocument;
};
