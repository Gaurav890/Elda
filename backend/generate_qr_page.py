"""
Generate QR Code HTML Page
Run this to create an HTML page with QR codes for all patients with setup tokens
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database.session import SessionLocal
from app.models.patient import Patient
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from datetime import datetime

db = SessionLocal()

try:
    # Get all patients with valid setup tokens
    patients = db.query(Patient).filter(
        Patient.setup_token.isnot(None),
        Patient.device_setup_completed == False
    ).all()

    if not patients:
        print("❌ No patients with valid setup tokens found!")
        print("\n💡 All patients are already setup. You can:")
        print("   1. Reset a patient's device_setup_completed to False")
        print("   2. Create a new test patient with the seed script")
        exit(1)

    print(f"Found {len(patients)} patient(s) ready for setup:\n")

    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elder Companion - Patient QR Codes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">👴🏻 Elder Companion</h1>
                    <p class="text-gray-600 text-lg">Patient Setup QR Codes</p>
                    <p class="text-sm text-gray-500 mt-2">Generated: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-blue-600">""" + str(len(patients)) + """</div>
                    <div class="text-gray-600">Ready to Setup</div>
                </div>
            </div>
        </div>

        <!-- Instructions -->
        <div class="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-lg">
            <h2 class="text-xl font-bold text-blue-900 mb-2">📱 How to Use:</h2>
            <ol class="list-decimal list-inside text-blue-800 space-y-2">
                <li>Open your iPhone Camera app</li>
                <li>Point it at any QR code below</li>
                <li>Tap the notification that appears</li>
                <li>Your Elder Companion app will open and complete setup!</li>
            </ol>
            <p class="mt-4 text-sm text-blue-700">
                <strong>💡 Tip:</strong> Each patient has different schedules and data - perfect for testing different scenarios!
            </p>
        </div>

        <!-- Patients Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
"""

    # Generate card for each patient
    for patient in patients:
        # Get stats
        schedules_count = db.query(Schedule).filter(
            Schedule.patient_id == patient.id,
            Schedule.is_active == True
        ).count()

        reminders_count = db.query(Reminder).filter(
            Reminder.patient_id == patient.id,
            Reminder.due_at >= datetime.utcnow(),
            Reminder.status == 'pending'
        ).count()

        has_letta = '✅' if patient.letta_agent_id else '❌'
        status_color = 'green' if schedules_count > 0 and patient.letta_agent_id else 'yellow'
        status_text = 'Fully Configured' if schedules_count > 0 and patient.letta_agent_id else 'Needs Setup'

        qr_id = f"qr-{patient.id}"
        qr_data = f'{{"patient_id": "{patient.id}", "setup_token": "{patient.setup_token}"}}'

        print(f"✅ {patient.full_name} ({patient.preferred_name})")
        print(f"   - Schedules: {schedules_count}")
        print(f"   - Reminders: {reminders_count}")
        print(f"   - Letta: {has_letta}")
        print()

        html_content += f"""
            <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-{status_color}-200">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h3 class="text-2xl font-bold mb-1">{patient.full_name}</h3>
                    <p class="text-blue-100">{patient.preferred_name or 'No nickname'}</p>
                    <div class="mt-3 inline-block px-3 py-1 bg-{status_color}-500 rounded-full text-sm font-semibold">
                        {status_text}
                    </div>
                </div>

                <!-- QR Code -->
                <div class="p-8 bg-gray-50 flex justify-center">
                    <div class="bg-white p-4 rounded-lg shadow-inner">
                        <canvas id="{qr_id}" class="mx-auto"></canvas>
                    </div>
                </div>

                <!-- Stats -->
                <div class="p-6 border-t border-gray-200">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">{schedules_count}</div>
                            <div class="text-sm text-gray-600">Schedules</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">{reminders_count}</div>
                            <div class="text-sm text-gray-600">Reminders</div>
                        </div>
                    </div>

                    <!-- Features -->
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Letta AI Agent:</span>
                            <span class="font-semibold">{has_letta} {('Active' if patient.letta_agent_id else 'Not Set')}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Age:</span>
                            <span class="font-semibold">{patient.age or 'N/A'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Medical Conditions:</span>
                            <span class="font-semibold">{len(patient.medical_conditions) if patient.medical_conditions else 0}</span>
                        </div>
                    </div>

                    <!-- Patient ID (for dev) -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-xs text-gray-500 font-mono break-all">
                            ID: {patient.id}
                        </p>
                    </div>
                </div>
            </div>

            <script>
                (function() {{
                    const qrData = {qr_data};
                    const canvas = document.getElementById('{qr_id}');
                    if (canvas) {{
                        QRCode.toCanvas(canvas, JSON.stringify(qrData), {{
                            width: 256,
                            margin: 2,
                            color: {{
                                dark: '#000000',
                                light: '#FFFFFF'
                            }}
                        }}, function (error) {{
                            if (error) console.error('QR Code generation error:', error);
                        }});
                    }}
                }})();
            </script>
"""

    html_content += """
        </div>
    </div>
</body>
</html>
"""

    # Write HTML file
    output_file = Path(__file__).parent / "patient_qr_codes.html"
    with open(output_file, 'w') as f:
        f.write(html_content)

    print(f"\n✅ QR Code page generated successfully!")
    print(f"\n📄 File: {output_file}")
    print(f"\n🌐 To open:")
    print(f"   open {output_file}")
    print(f"\n   Or manually open in browser and scan with your iPhone!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
