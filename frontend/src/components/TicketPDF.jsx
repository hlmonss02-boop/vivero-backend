import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Colores profesionales
const colors = {
    primary: '#485935',
    secondary: '#93A267',
    accent: '#D97757',
    light: '#CADBB7',
    white: '#FFFFFF',
    text: '#1B4332',
    textLight: '#6B7280'
};

// Ruta del logo local
const LOGO_URL = '/logo.png';

const styles = StyleSheet.create({
    page: {
        padding: 15,
        backgroundColor: colors.white,
        fontFamily: 'Helvetica',
        position: 'relative'
    },
    // Fondo con logo (marca de agua)
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fondoLogo: {
        width: 200,
        height: 200
    },
    center: {
        textAlign: 'center',
        marginBottom: 8
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2
    },
    subtitle: {
        fontSize: 8,
        color: colors.secondary,
        marginBottom: 2
    },
    bold: {
        fontWeight: 'bold'
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.light,
        marginVertical: 6
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
        fontSize: 7
    },
    infoLabel: {
        fontWeight: 'bold',
        color: colors.primary
    },
    infoValue: {
        color: colors.text
    },
    folio: {
        backgroundColor: '#F5F5F5',
        padding: 4,
        textAlign: 'center',
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.accent,
        marginVertical: 6
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        padding: 4,
        marginVertical: 4
    },
    tableHeaderText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: colors.white
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.light
    },
    tableText: {
        fontSize: 7,
        color: colors.text
    },
    colProducto: { width: '45%' },
    colCantidad: { width: '20%', textAlign: 'center' },
    colPrecio: { width: '17%', textAlign: 'center' },
    colSubtotal: { width: '18%', textAlign: 'right' },
    total: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 6,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: colors.accent
    },
    totalText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text,
        marginRight: 6
    },
    totalMonto: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.accent
    },
    gracias: {
        textAlign: 'center',
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 10,
        marginBottom: 4
    },
    footer: {
        textAlign: 'center',
        fontSize: 6,
        color: colors.textLight,
        marginTop: 8,
        paddingTop: 4,
        borderTopWidth: 0.5,
        borderTopColor: colors.light
    }
});

const TicketPDF = ({ venta, carrito, total, folio, vendedor }) => (
    <Document>
        <Page size="A6" style={styles.page}>
            {/* Logo de fondo (marca de agua) */}
            <View style={styles.backgroundImage} fixed>
                <Image src={LOGO_URL} style={styles.fondoLogo} />
            </View>

            {/* Contenido principal */}
            <View>
                {/* Header */}
                <View style={styles.center}>
                    <Text style={styles.title}>VIVERO JUANITO</Text>
                    <Text style={styles.subtitle}>Plantas de ornato, jardinería y </Text>
                    <Text style={styles.subtitle}>hierbas de olor</Text>
                </View>

                <View style={styles.divider} />

                {/* Información */}
                <View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ubicacion:</Text>
                        <Text style={styles.infoValue}>R35Q+7G, San Lorenzo Tlacotepec, Mex.</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>WhatsApp:</Text>
                        <Text style={styles.infoValue}>712 314 3713 - 712 262 9486</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Vendedor:</Text>
                        <Text style={styles.infoValue}>{vendedor|| venta.vendedor_nombre ||'Vendedor'}</Text>
                    </View>
                </View>

                {/* Folio */}
                <View style={styles.folio}>
                    <Text >FOLIO: {folio}</Text>
                </View>

                {/* Fecha y cliente */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha:</Text>
                    <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
                </View>
                {venta.cliente_nombre && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Cliente:</Text>
                        <Text style={styles.infoValue}>{venta.cliente_nombre}</Text>
                    </View>
                )}
                {venta.cliente_telefono && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telefono:</Text>
                        <Text style={styles.infoValue}>{venta.cliente_telefono}</Text>
                    </View>
                )}

                <View style={styles.divider} />

                {/* Tabla */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colProducto]}>Producto</Text>
                    <Text style={[styles.tableHeaderText, styles.colCantidad]}>Cant.</Text>
                    <Text style={[styles.tableHeaderText, styles.colPrecio]}>Precio</Text>
                    <Text style={[styles.tableHeaderText, styles.colSubtotal]}>Subtotal</Text>
                </View>

                {carrito.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableText, styles.colProducto]}>{item.nombre}</Text>
                        <Text style={[styles.tableText, styles.colCantidad]}>{item.cantidad} {item.unidad_medida}</Text>
                        <Text style={[styles.tableText, styles.colPrecio]}>${item.precio_pactado}</Text>
                        <Text style={[styles.tableText, styles.colSubtotal]}>${item.subtotal}</Text>
                    </View>
                ))}

                {/* Total */}
                <View style={styles.total}>
                    <Text style={styles.totalText}>TOTAL:</Text>
                    <Text style={styles.totalMonto}>${total}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Metodo de pago:</Text>
                    <Text style={styles.infoValue}>{venta.metodo_pago}</Text>
                </View>

                {venta.porcentaje_ahorro > 0 && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ahorro (renta):</Text>
                        <Text style={styles.infoValue}>{venta.porcentaje_ahorro}%</Text>
                    </View>
                )}

                {/* Gracias */}
                <Text style={styles.gracias}>Gracias por su compra!</Text>
                <Text style={styles.gracias}>Vuelva pronto!</Text>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Vivero Juanito - San Lorenzo Tlacotepec</Text>
                    <Text>Plantas de ornato, jardineria y hierbas de olor</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default TicketPDF;