from datetime import datetime, timedelta
import random
from models import Department, Complaint, TimelineEvent
from database import SessionLocal, Base, engine

# Core departments definitions
DEPARTMENTS_SEED = [
    {
        "name": "Road Maintenance Division",
        "code": "ROADS",
        "lead": "Shri Rajesh Kumar",
        "sla_days": 7,
        "risk_index": 28.5,
        "performance_score": 79.2,
        "budget_utilization": 64.8
    },
    {
        "name": "Municipal Water Department",
        "code": "WATER",
        "lead": "Smt. Sunita Sharma",
        "sla_days": 5,
        "risk_index": 42.1,
        "performance_score": 68.4,
        "budget_utilization": 78.5
    },
    {
        "name": "Power Grid Board",
        "code": "POWER",
        "lead": "Shri Anil Gupta",
        "sla_days": 3,
        "risk_index": 12.8,
        "performance_score": 91.5,
        "budget_utilization": 53.2
    },
    {
        "name": "Waste Management Authority",
        "code": "GARBAGE",
        "lead": "Shri Vinay Patel",
        "sla_days": 4,
        "risk_index": 35.0,
        "performance_score": 74.0,
        "budget_utilization": 48.9
    },
    {
        "name": "Public Safety Command",
        "code": "SAFETY",
        "lead": "Smt. Priyanka Rao",
        "sla_days": 6,
        "risk_index": 18.2,
        "performance_score": 86.4,
        "budget_utilization": 37.5
    },
    {
        "name": "Anti-Corruption Vigilance Bureau",
        "code": "CORRUPTION",
        "lead": "Shri Devendra Prasad",
        "sla_days": 10,
        "risk_index": 5.4,
        "performance_score": 94.8,
        "budget_utilization": 22.1
    }
]

# Set coordinates centered near Indore (Vijay Nagar / C21 Mall / LIG area)
CENTRAL_LAT = 22.7500
CENTRAL_LNG = 75.8900

def get_random_coords(offset_range=0.03):
    lat = CENTRAL_LAT + random.uniform(-offset_range, offset_range)
    lng = CENTRAL_LNG + random.uniform(-offset_range, offset_range)
    return round(lat, 5), round(lng, 5)

# Seed complaint descriptions representing multiple departments and scenarios
COMPLAINTS_SEED_TEMPLATES = [
    # ROADS
    ("Severe potholes on the main road of Scheme 54", "There are deep potholes near C21 Mall main road. Last night, two motorcyclists slipped. This is extremely dangerous during night hours due to lack of indicators.", "ROADS", "High", -0.7),
    ("Caved-in asphalt on LIG Link Road", "A large section of the asphalt has caved in near the LIG crossing. It's causing massive traffic jams during peak office hours. Heavy vehicles might get stuck.", "ROADS", "High", -0.6),
    ("Unfinished road repair in Sector B, Vijay Nagar", "The contractor left the road half-graveled three weeks ago near Sector B. Loose gravel is flying around and breaking car windshields. Dust pollution is also severe.", "ROADS", "Medium", -0.5),
    ("Broken divider on Ring Road", "The concrete divider near the Sector 74 turn is completely shattered, exposing metal rods. Cars frequently swerve to avoid it, causing near-misses.", "ROADS", "Medium", -0.4),
    ("Massive sinkhole near Shalimar Township entrance", "A huge sinkhole has formed overnight near the main gate. The soil is continuously slipping underneath the paved road. Needs urgent concrete reinforcement.", "ROADS", "Critical", -0.8),
    ("Damaged pavement near TI Mall", "The pedestrian footpath has been completely dug up for laying utility cables, but not restored. Seniors cannot walk safely.", "ROADS", "Low", -0.3),
    ("Crack on flyover pillar near Press Complex", "Spotted structural cracks running down Pillar 14 on the press complex flyover. This looks like a major safety risk. Urgent inspections required.", "ROADS", "Critical", -0.9),
    ("Waterlogging leading to road peeling in Scheme 78", "Poor drainage is causing water to accumulate on the road, which has peeled off the top asphalt layer. Entire stretch is gravel now.", "ROADS", "High", -0.5),

    # WATER
    ("Major sewage pipe burst near Vijay Nagar square", "A primary sewage pipe has burst open, flooding the service lane with dirty water. The stench is unbearable and it poses a huge health hazard.", "WATER", "Critical", -0.9),
    ("Contaminated water supply in Sector A, Scheme 54", "For the last 3 days, tap water supplied by the corporation has been muddy and smelling of sewage. Many children in our building have fallen sick.", "WATER", "Critical", -0.8),
    ("Water leakage from main valve near Meghdoot Garden", "Clean drinking water is leaking in huge volumes from the air release valve near Meghdoot Garden. Thousands of liters of water are being wasted daily.", "WATER", "High", -0.4),
    ("Low water pressure in Sukhlia residential area", "We are receiving municipal water for only 10 minutes a day and with extremely low pressure. Residents are forced to buy private tankers.", "WATER", "Medium", -0.3),
    ("Open drainage line overflowing in Malviya Nagar", "An open drain is completely clogged with garbage, causing dirty sewage to overflow onto pedestrian pathways and into residential gates.", "WATER", "High", -0.7),
    ("Broken water pipeline in Sector C", "Pipeline supplying drinking water is cracked near street number 4. Water is pooling on the road and causing mosquito breeding.", "WATER", "Medium", -0.4),
    ("Sewage water mixing with drinking water line in Zone 5", "Extremely urgent. Black-colored sewage water is coming out of the fresh drinking water taps since this morning. Suspected pipeline crossover leakage.", "WATER", "Critical", -0.95),
    ("Uncovered manhole near Bapat Square", "There is a completely open manhole in the middle of the road. No barricade is placed. High risk of fatal accidents, especially during rains.", "WATER", "Critical", -0.85),

    # POWER
    ("Fallen high-voltage wire near Scheme 114 park", "A live overhead electricity wire has snapped and fallen onto the metallic swings of the kids' play park. Emergency shutdown needed immediately!", "POWER", "Critical", -0.95),
    ("Frequent voltage fluctuations in Vijay Nagar Sector C", "Extreme voltage drops are occurring every few minutes. Several household appliances, including two refrigerators, have burned out today.", "POWER", "High", -0.6),
    ("Damaged transformer sparking near LIG Colony", "The transformer installed near LIG Sector 3 is constantly emitting loud buzzing sounds and occasional blue sparks. Visible oil leakage from the tank.", "POWER", "Critical", -0.8),
    ("No electricity supply for 18 hours in Scheme 74", "Unannounced power cut has lasted since yesterday night. Local sub-station numbers are switched off. Residents are struggling in extreme heat.", "POWER", "High", -0.7),
    ("Loose electrical cables dangling over footpath", "Low-hanging power lines are dangling just 5 feet above the pedestrian walkway near the main market. Tall pedestrians are at risk of electrocution.", "POWER", "High", -0.7),
    ("Streetlight pole rusted and leaning dangerously", "An electric pole near Vijay Nagar school is severely rusted at the base and is leaning towards the road. Strong winds could crash it.", "POWER", "Medium", -0.5),
    ("Frequent power trips during afternoon in Sector D", "Daily power failures for 10-15 minutes occur 5-6 times every afternoon. Power grid overload suspected.", "POWER", "Medium", -0.4),

    # GARBAGE
    ("Overflowing garbage bin near Scheme 54 market", "The municipal garbage bin is overflowing. Garbage is strewn all over the road. Stray dogs and cows are feeding on it, blocking traffic.", "GARBAGE", "Medium", -0.5),
    ("Illegal commercial dumpyard forming in Sector D", "Commercial trucks are dumping plastic waste and construction debris in an open residential plot at night. Heavy chemical smell in the air.", "GARBAGE", "High", -0.7),
    ("No garbage collection vehicle for 5 days in Sukhlia", "The daily door-to-door garbage collection truck has not visited our sector for 5 days. Wet garbage is rotting in homes and breeding maggots.", "GARBAGE", "High", -0.6),
    ("Dead animal carcass rotting near Ring Road side", "A dead stray animal carcass has been lying on the side of the road for 3 days. The stench is horrible and creating toxic sanitary conditions.", "GARBAGE", "High", -0.8),
    ("Plastic burning and toxic fumes near sector boundary", "Security guards or sweeps are burning dry leaves mixed with massive amounts of plastics every morning, filling the entire colony with black toxic smoke.", "GARBAGE", "Medium", -0.5),
    ("Clogged drains due to plastic trash accumulation", "Drains around Vijay Nagar Sector 2 are fully packed with single-use plastic bottles and bags. The water has stagnated and turned black.", "GARBAGE", "Medium", -0.5),
    ("E-waste dumped near water tank", "Several broken computer monitors and lead-acid batteries have been dumped beside the community water tank. Risk of heavy metal contamination.", "GARBAGE", "High", -0.7),

    # SAFETY
    ("Complete lack of streetlights on Scheme 78 main stretch", "The entire 1.5 km stretch of Scheme 78 road is pitch black at night due to non-functional streetlights. Multiple snatching incidents reported this month.", "SAFETY", "High", -0.8),
    ("Stray dog menace and aggressive packs near school", "A pack of 12-15 aggressive stray dogs has nested near the primary school gate. Three children have been bitten this week while going home.", "SAFETY", "High", -0.7),
    ("Illegal parking blocking fire tender access route", "Commercial private buses are permanently parked double-wide in the narrow lane near Block C, completely blocking emergency fire engine access.", "SAFETY", "High", -0.5),
    ("Drug peddling and dark alley activity near LIG park", "Unidentified youths gather in the unlit corner of LIG colony park every evening, selling substances and harassing ladies walking nearby. No patrol.", "SAFETY", "Critical", -0.8),
    ("Broken surveillance camera at major junction", "The smart city CCTV camera installed at Vijay Nagar main crossing is physically broken and dangling from the pole. Security surveillance is disabled.", "SAFETY", "Medium", -0.4),
    ("Open high-voltage junction box on sidewalk", "An iron junction box on the sidewalk near the metro station has its doors open, exposing thick copper bars with live power. Child could touch it.", "SAFETY", "Critical", -0.9),
    ("Eve-teasing and harassment zone near girl's hostel", "Drunk men gather near the local paan shop opposite the hostel every night after 9 PM. Passers-by feel highly unsafe.", "SAFETY", "High", -0.8),

    # CORRUPTION
    ("Clerk demanding bribe for property tax correction", "A clerk at the Zone 4 municipal office is demanding Rs. 5,000 cash bribe to correct a minor clerical typo in my property tax receipt.", "CORRUPTION", "Critical", -0.9),
    ("Encroachment extortion by local inspection officer", "An administrative inspector is threatening to seal our legal shop unless we pay him a monthly 'fees' of Rs. 2,000. He refused to check our documents.", "CORRUPTION", "Critical", -0.9),
    ("Siphoning of road construction materials by contractor", "Spotted contractor laborers moving government-stamped cement bags and steel reinforcement bars from the public road site to a private site nearby.", "CORRUPTION", "High", -0.8),
    ("Bribery demanded for issuing death certificate", "The registrar clerk is delaying the issuance of my late grandfather's death certificate for 20 days. He openly told me 'make me happy to speed it up'.", "CORRUPTION", "Critical", -0.95),
    ("Fake bill clearance in sewage department", "Suspected scam where bills for laying pipelines in Sector E are cleared without any work being done on site. The area still has no sewage connections.", "CORRUPTION", "High", -0.8),
    ("Building plan approval delayed due to refusal to pay bribe", "My residential single-floor building plan is fully compliant but kept pending for 6 months. High-ranking officer hinted a 10% fee will get it approved instantly.", "CORRUPTION", "High", -0.7),
]

# Generate 50 unique complaints by extending the template pool and generating realistic variations
def seed_database():
    db = SessionLocal()
    
    # 1. Clear existing database tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("Database structures cleared and created. Seeding departments...")
    
    # 2. Add departments
    dept_objs = {}
    for d in DEPARTMENTS_SEED:
        dept = Department(
            name=d["name"],
            code=d["code"],
            lead=d["lead"],
            sla_days=d["sla_days"],
            risk_index=d["risk_index"],
            performance_score=d["performance_score"],
            budget_utilization=d["budget_utilization"]
        )
        db.add(dept)
        db.commit()
        db.refresh(dept)
        dept_objs[d["code"]] = dept
        
    print("Departments seeded. Seeding 50 detailed complaints and timeline events...")
    
    random.seed(42) # For reproducible seeds
    
    # We will expand complaints list to reach 52 items
    all_complaints = []
    
    # First, populate from templates
    for i, t in enumerate(COMPLAINTS_SEED_TEMPLATES):
        all_complaints.append(t)
        
    # Duplicate some with minor text differences to create realistic duplicates (e.g. at index 50, 51)
    # This will be perfect for demonstrating FAISS duplicate detection!
    all_complaints.append((
        "Very deep pothole near Scheme 54 C21 Mall", 
        "There is a deep dangerous pothole near C21 Mall road in Scheme 54. Two riders fell off last night, it is very risky.", 
        "ROADS", "High", -0.75
    )) # Duplicate of index 0
    
    all_complaints.append((
        "Tap water smelling like sewage in Scheme 54", 
        "In Scheme 54 Sector A, we are getting muddy and smelly water from municipal supply since 3 days. Kids are falling sick.", 
        "WATER", "Critical", -0.85
    )) # Duplicate of index 9

    # Add more custom filler complaints to reach 50+ items
    while len(all_complaints) < 53:
        random_tmpl = random.choice(COMPLAINTS_SEED_TEMPLATES)
        # Create a variations
        title = f"Ref: {random_tmpl[0]} in Zone {random.randint(1, 9)}"
        desc = f"Reported issue: {random_tmpl[1]} This is recurring near street {random.randint(1, 15)}."
        all_complaints.append((title, desc, random_tmpl[2], random_tmpl[3], random_tmpl[4]))
        
    # Standard status pool:
    # 20 resolved, 12 escalated, 10 in progress, 8 routed, 3 pending
    status_pool = (
        ["Resolved"] * 20 + 
        ["Escalated"] * 12 + 
        ["In Progress"] * 12 + 
        ["Routed"] * 6 + 
        ["Pending"] * 3
    )
    random.shuffle(status_pool)
    
    # Store seeded complaints for duplicate tracking during loop
    seeded_ids = []
    
    for idx, (title, desc, dept_code, urgency, sentiment) in enumerate(all_complaints):
        lat, lng = get_random_coords(offset_range=0.025)
        status = status_pool[idx % len(status_pool)]
        
        # Configure age and delay parameters to simulate reality
        # Resolved items should have completed timelines
        # Escalated items should have older ages exceeding SLA
        dept_model = dept_objs[dept_code]
        sla_limit = dept_model.sla_days
        
        if status == "Resolved":
            age_days = random.randint(3, 10)
            resolution_days = round(random.uniform(1.5, float(sla_limit) + 2.0), 1)
            escalation_level = 0
            negligence = False
        elif status == "Escalated":
            age_days = random.randint(sla_limit + 3, 25) # Exceeds SLA!
            resolution_days = None
            escalation_level = random.randint(1, 3)
            negligence = True if age_days > (sla_limit * 2) else False
        elif status == "In Progress":
            age_days = random.randint(1, sla_limit)
            resolution_days = None
            escalation_level = 0
            negligence = False
        else: # Routed or Pending
            age_days = random.randint(0, 2)
            resolution_days = None
            escalation_level = 0
            negligence = False
            
        # Determine duplicate reference
        duplicate_ref = None
        # Link our custom duplicate entries explicitly
        if idx == 43: # Duplicate of 0
            duplicate_ref = 1
        elif idx == 44: # Duplicate of 9
            duplicate_ref = 9

        # Custom confidence score
        confidence = round(random.uniform(0.82, 0.99), 2)
        
        # Surrounding density score (calculated based on department issues in that sub-zone)
        density = round(random.uniform(0.1, 0.9) if urgency in ["High", "Critical"] else random.uniform(0.05, 0.3), 2)
        
        created_time = datetime.utcnow() - timedelta(days=age_days)
        updated_time = datetime.utcnow() if status == "Resolved" else (created_time + timedelta(days=min(age_days, 3)))
        
        complaint = Complaint(
            title=title,
            description=desc,
            category=list(CATEGORIES_MAPPING.keys())[list(CATEGORIES_MAPPING.values()).index(CATEGORIES_MAPPING[dept_code])],
            sentiment=sentiment,
            urgency=urgency,
            status=status,
            location=f"Zone {random.randint(1, 9)}, Vijay Nagar",
            latitude=lat,
            longitude=lng,
            duplicate_ref_id=duplicate_ref,
            escalation_level=escalation_level,
            negligence_flag=negligence,
            confidence_score=confidence,
            age_days=age_days,
            density_score=density,
            resolution_time_days=resolution_days,
            department_id=dept_model.id,
            created_at=created_time,
            updated_at=updated_time
        )
        
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        seeded_ids.append(complaint.id)
        
        # 3. Seed Timeline events for each complaint based on its lifecycle status
        # Step A: citizen filing
        evt_filed = TimelineEvent(
            complaint_id=complaint.id,
            title="Complaint Registered",
            description="Citizen filed a grievance via BharatSync AI portal.",
            event_type="filed",
            created_at=created_time
        )
        db.add(evt_filed)
        
        # Step B: AI Triage & routing
        evt_triage = TimelineEvent(
            complaint_id=complaint.id,
            title="AI Classification & Triage Complete",
            description=f"BharatSync Triage Engine classified grievance under '{complaint.category}' with {int(confidence*100)}% confidence. Routed to {dept_model.name}.",
            event_type="analyzed",
            created_at=created_time + timedelta(minutes=2)
        )
        db.add(evt_triage)
        
        # Step C: Routed/Assigned event
        evt_assigned = TimelineEvent(
            complaint_id=complaint.id,
            title="Department Assignment Acknowledged",
            description=f"Grievance accepted by {dept_model.name} officer. SLA target set to {sla_limit} days.",
            event_type="assigned",
            created_at=created_time + timedelta(hours=3)
        )
        db.add(evt_assigned)
        
        # If in progress, escalated, or resolved, add more historical steps
        if status in ["In Progress", "Escalated", "Resolved"]:
            # Action taken
            evt_progress = TimelineEvent(
                complaint_id=complaint.id,
                title="Investigation Initiated",
                description="Field inspection team assigned to review site parameters.",
                event_type="comment",
                created_at=created_time + timedelta(days=1, hours=2)
            )
            db.add(evt_progress)
            
        if status == "Escalated":
            # Exceeded SLA event
            evt_warning = TimelineEvent(
                complaint_id=complaint.id,
                title="SLA Breach Alert Generated",
                description=f"Resolution time exceeded designated SLA limit of {sla_limit} days for {dept_model.name}.",
                event_type="warning",
                created_at=created_time + timedelta(days=sla_limit)
            )
            db.add(evt_warning)
            
            # Level-1 escalation
            level_titles = {
                1: f"Escalated to Level 1: Department Head ({dept_model.lead})",
                2: "Escalated to Level 2: District Commissioner",
                3: "Escalated to Level 3: State Grievance Secretariat"
            }
            evt_esc = TimelineEvent(
                complaint_id=complaint.id,
                title=level_titles.get(complaint.escalation_level, "Grievance Escalated"),
                description=f"AI engine triggered automatic escalation due to SLA neglect and citizen negative sentiment index ({sentiment}).",
                event_type="escalated",
                created_at=created_time + timedelta(days=sla_limit + 2)
            )
            db.add(evt_esc)
            
        elif status == "Resolved":
            evt_resolved = TimelineEvent(
                complaint_id=complaint.id,
                title="Grievance Resolved",
                description="Field works completed and inspected. Site photos uploaded and citizen notified of completion.",
                event_type="resolved",
                created_at=created_time + timedelta(days=int(resolution_days or 3))
            )
            db.add(evt_resolved)
            
        db.commit()
        
    print(f"Successfully seeded {len(seeded_ids)} complaints and their timeline events in the database!")
    db.close()

if __name__ == "__main__":
    seed_database()
