import xml.etree.ElementTree as ET

# Load the GPX file
with open("route.gpx", "r") as file:
    gpx_data = file.read()

# Parse the XML
root = ET.fromstring(gpx_data)

# Define namespace
ns = {'default': 'http://www.topografix.com/GPX/1/1'}

# Find all trkpt elements
trkpts = root.findall(".//default:trkpt", ns)

# Extract and print lat/lon values
coords = [(float(pt.attrib['lat']), float(pt.attrib['lon'])) for pt in trkpts]
with open("coordinates.txt", "w") as out_file:
    for lat, lon in coords:
        out_file.write(f"{lat}, {lon}\n")
