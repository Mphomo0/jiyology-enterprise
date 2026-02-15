import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const PRIMARY = '#1f2937' // dark slate
const ACCENT = '#2563eb' // blue
const LIGHT_GRAY = '#f3f4f6'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111',
  },

  /* ===== HEADER ===== */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 70,
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
    color: '#555',
  },

  /* ===== TITLE ===== */
  titleSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  invoiceMeta: {
    marginTop: 5,
    fontSize: 10,
    color: '#666',
  },

  /* ===== BILL TO ===== */
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ===== TABLE ===== */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GRAY,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  description: { flex: 3 },
  qty: { flex: 1, textAlign: 'right' },
  price: { flex: 1.5, textAlign: 'right' },
  amount: { flex: 1.5, textAlign: 'right' },

  /* ===== TOTALS ===== */
  totalsContainer: {
    marginTop: 25,
    alignSelf: 'flex-end',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: PRIMARY,
    fontWeight: 'bold',
    fontSize: 14,
  },

  /* ===== FOOTER ===== */
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888',
  },

  /* ===== STATUS BADGE ===== */
  statusSection: {
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 10,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
})

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface InvoicePDFProps {
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  issuedAt: string
  dueDate: string
  status: string
  paidAt?: string
}

export function InvoicePDF({
  invoiceNumber,
  clientName,
  clientEmail,
  clientAddress,
  items,
  subtotal,
  tax,
  total,
  issuedAt,
  dueDate,
  status,
  paidAt,
}: InvoicePDFProps) {
  const statusColors: Record<string, string> = {
    draft: '#6b7280',
    sent: '#3b82f6',
    paid: '#22c55e',
    overdue: '#ef4444',
    cancelled: '#6b7280',
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== HEADER WITH LOGO ===== */}
        <View style={styles.header}>
          <Image
            src="http://localhost:3000/images/logo.png"
            style={styles.logo}
          />

          <View style={styles.companyInfo}>
            <Text>Jiyology Enterprise (Pty) Ltd</Text>
            <Text>Ext 2, 65 Tsemeli St,</Text>
            <Text>Emdeni South, Soweto, 1861</Text>
            <Text>vusijiya26@gmail.com</Text>
          </View>
        </View>

        {/* ===== TITLE & STATUS ===== */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceMeta}>
            Invoice #: {invoiceNumber} | Issued: {issuedAt} | Due: {dueDate}
          </Text>
          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: statusColors[status] || '#6b7280' }]}>
              {status.toUpperCase()}
            </Text>
            {status === 'paid' && paidAt && (
              <Text style={{ fontSize: 10, color: '#22c55e' }}>
                Paid on: {paidAt}
              </Text>
            )}
          </View>
        </View>

        {/* ===== CLIENT ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{clientName}</Text>
          {clientEmail && <Text>{clientEmail}</Text>}
          {clientAddress && <Text>{clientAddress}</Text>}
        </View>

        {/* ===== ITEMS TABLE ===== */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.qty}>Qty</Text>
            <Text style={styles.price}>Unit Price</Text>
            <Text style={styles.amount}>Amount</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
              <Text style={styles.amount}>
                R{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ===== TOTALS ===== */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>R{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT (15%):</Text>
            <Text>R{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total Due:</Text>
            <Text>R{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <Text style={styles.footer}>
          Thank you for your business. Please make payment by the due date to avoid late fees.
        </Text>
      </Page>
    </Document>
  )
}
