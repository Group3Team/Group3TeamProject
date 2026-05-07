# Seed data for DogGO test database
# Run from project root after applying all migrations:
#   docker compose -p group3teamproject exec backend python manage.py migrate
# Then run this script:
#   docker compose -p group3teamproject cp /home/na/Desktop/CodePlatoon/Group3TeamProject/backend/users/management/commands/seed_data.py backend:/app/seeder.py
#   docker compose -p group3teamproject exec backend bash -c "cat /app/seeder.py | python manage.py shell --interface python"

from django.contrib.auth import get_user_model
from users.models import OwnerProfile, WalkerProfile
from walks.models import Dog
from django.contrib.gis.geos import Point
import os

User = get_user_model()

print("=" * 60)
print("DogGO Seed Data Import")
print("=" * 60)

# ============================================================
# Dog Owners (5 accounts)
# Coordinates placed across the Bay Area for spatial query testing
# All within ~32 km of each other (supports 20-mile radius matching)
# ============================================================
owners_data = [
    {
        "username": "dogowner1",
        "email": "owner1@test.com",
        "password": "Test1234",
        "first_name": "Alice",
        "last_name": "Johnson",
        # San Francisco — Mission District
        "home_location": Point(-122.4148, 37.7599, srid=4326),
    },
    {
        "username": "dogowner2",
        "email": "owner2@test.com",
        "password": "Test1234",
        "first_name": "Bob",
        "last_name": "Smith",
        # San Francisco — Sunset District
        "home_location": Point(-122.4860, 37.7490, srid=4326),
    },
    {
        "username": "dogowner3",
        "email": "owner3@test.com",
        "password": "Test1234",
        "first_name": "Carol",
        "last_name": "Martinez",
        # Oakland — Downtown
        "home_location": Point(-122.2712, 37.8044, srid=4326),
    },
    {
        "username": "dogowner4",
        "email": "owner4@test.com",
        "password": "Test1234",
        "first_name": "David",
        "last_name": "Kim",
        # Palo Alto
        "home_location": Point(-122.1430, 37.4419, srid=4326),
    },
    {
        "username": "dogowner5",
        "email": "owner5@test.com",
        "password": "Test1234",
        "first_name": "Elena",
        "last_name": "Patel",
        # Walnut Creek — further east (~30 miles from SF)
        "home_location": Point(-122.0653, 37.9063, srid=4326),
    },
]

created_owners = []
for data in owners_data:
    user, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": data["email"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "role": "OWNER",
        },
    )
    if not created:
        user.email = data["email"]
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.role = "OWNER"
        user.set_password(data["password"])
        user.save()

    op, _ = OwnerProfile.objects.get_or_create(
        user=user,
        defaults={"home_location": data["home_location"]},
    )
    if not _:
        op.home_location = data["home_location"]
        op.save()

    created_owners.append(user)
    status = "CREATED" if created else "EXISTING (updated)"
    print(f"[{status}] Owner: {user.username} ({data['first_name']} {data['last_name']})")

# ============================================================
# Dogs for each owner
# ============================================================
dogs_data = [
    {"owner": created_owners[0], "name": "Rover",          "breed": "Husky",            "size": "LARGE",  "notes": "Likes to play fetch"},
    {"owner": created_owners[0], "name": "Bella",           "breed": "Border Collie",     "size": "MEDIUM", "notes": "Very energetic, needs lots of exercise"},

    {"owner": created_owners[1], "name": "Bob",             "breed": "German Shepard",   "size": "LARGE",  "notes": "Loves to run, well-trained"},
    {"owner": created_owners[1], "name": "Daisy",           "breed": "Labrador Retriever","size": "LARGE",  "notes": "Friendly with other dogs, gentle"},

    {"owner": created_owners[2], "name": "Charlie",         "breed": "Beagle",            "size": "SMALL",  "notes": "Curious, follows nose everywhere"},
    {"owner": created_owners[3], "name": "Milo",            "breed": "French Bulldog",    "size": "SMALL",  "notes": "Low energy, short walks are enough"},

    {"owner": created_owners[4], "name": "Luna",            "breed": "Australian Shepherd","size": "MEDIUM", "notes": "Intelligent, responds to commands"},
    {"owner": created_owners[4], "name": "Max",             "breed": "Golden Retriever",  "size": "LARGE",  "notes": "Friendly with everyone, loves water"},
]

for d in dogs_data:
    dog = Dog.objects.create(
        owner=d["owner"],
        name=d["name"],
        breed=d["breed"],
        size=d["size"],
        notes=d["notes"],
    )
    print(f"  [CREATED] Dog: {dog.name} ({dog.breed}, {d['size']}) owned by {d['owner'].username}")

# ============================================================
# Dog Walkers (3 accounts) — all set online with service locations
# ============================================================
walkers_data = [
    {
        "username": "walker1",
        "email": "walker1@test.com",
        "password": "Test1234",
        "first_name": "Sarah",
        "last_name": "Williams",
        # San Francisco — Mission, close to dogowner1 and dogowner2
        "service_location": Point(-122.4148, 37.7599, srid=4326),
    },
    {
        "username": "walker2",
        "email": "walker2@test.com",
        "password": "Test1234",
        "first_name": "Mike",
        "last_name": "Chen",
        # Oakland — Downtown, close to dogowner3
        "service_location": Point(-122.2712, 37.8044, srid=4326),
    },
    {
        "username": "walker3",
        "email": "walker3@test.com",
        "password": "Test1234",
        "first_name": "Jessica",
        "last_name": "Davis",
        # Redwood City — can reach Palo Alto (dogowner4) and parts of SF
        "service_location": Point(-122.2364, 37.4852, srid=4326),
    },
]

for data in walkers_data:
    user, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": data["email"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "role": "WALKER",
        },
    )
    if not created:
        user.email = data["email"]
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.role = "WALKER"
        user.set_password(data["password"])
        user.save()

    wp, _ = WalkerProfile.objects.get_or_create(
        user=user,
        defaults={
            "current_location": data["service_location"],
            "is_online": True,
            "max_dogs": 3,
            "service_radius_km": 20.0,
        },
    )
    if not _:
        wp.current_location = data["service_location"]
        wp.is_online = True
        wp.max_dogs = 3
        wp.service_radius_km = 20.0
        wp.save()

    status = "CREATED" if created else "EXISTING (updated)"
    print(f"[{status}] Walker: {user.username} ({data['first_name']} {data['last_name']})")

# ============================================================
# Summary
# ============================================================
print("")
print("=" * 60)
print("SEED DATA SUMMARY")
print("=" * 60)
print(f"Total Owners:      {len(created_owners)}")
for o in created_owners:
    dog_count = Dog.objects.filter(owner=o).count()
    print(f"  - {o.username} ({o.email}) — {dog_count} dog(s)")

walker_count = User.objects.filter(role='WALKER').count()
print(f"Total Walkers:     {walker_count}")
for w in User.objects.filter(role='WALKER'):
    wp = WalkerProfile.objects.get(user=w)
    print(f"  - {w.username} ({w.email}) — online={wp.is_online}, radius={wp.service_radius_km}km")

print("")
print("Credentials for ALL accounts:")
print("  Password: Test1234 (same for every account)")
print("=" * 60)
print("")
print("All Owner usernames: dogowner1, dogowner2, dogowner3, dogowner4, dogowner5")
print("All Walker usernames: walker1, walker2, walker3")
