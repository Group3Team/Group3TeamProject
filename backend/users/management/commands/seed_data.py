from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import OwnerProfile, WalkerProfile
from walks.models import Dog
from django.contrib.gis.geos import Point


User = get_user_model()

owners_data = [
    {
        "username": "dogowner1",
        "email": "owner1@test.com",
        "password": "Test1234",
        "first_name": "Alice",
        "last_name": "Johnson",
        "home_location": Point(-122.4148, 37.7599, srid=4326),
    },
    {
        "username": "dogowner2",
        "email": "owner2@test.com",
        "password": "Test1234",
        "first_name": "Bob",
        "last_name": "Smith",
        "home_location": Point(-122.4860, 37.7490, srid=4326),
    },
    {
        "username": "dogowner3",
        "email": "owner3@test.com",
        "password": "Test1234",
        "first_name": "Carol",
        "last_name": "Martinez",
        "home_location": Point(-122.2712, 37.8044, srid=4326),
    },
    {
        "username": "dogowner4",
        "email": "owner4@test.com",
        "password": "Test1234",
        "first_name": "David",
        "last_name": "Kim",
        "home_location": Point(-122.1430, 37.4419, srid=4326),
    },
    {
        "username": "dogowner5",
        "email": "owner5@test.com",
        "password": "Test1234",
        "first_name": "Elena",
        "last_name": "Patel",
        "home_location": Point(-122.0653, 37.9063, srid=4326),
    },
]

walkers_data = [
    {
        "username": "walker1",
        "email": "walker1@test.com",
        "password": "Test1234",
        "first_name": "Sarah",
        "last_name": "Williams",
        "service_location": Point(-122.4148, 37.7599, srid=4326),
    },
    {
        "username": "walker2",
        "email": "walker2@test.com",
        "password": "Test1234",
        "first_name": "Mike",
        "last_name": "Chen",
        "service_location": Point(-122.2712, 37.8044, srid=4326),
    },
    {
        "username": "walker3",
        "email": "walker3@test.com",
        "password": "Test1234",
        "first_name": "Jessica",
        "last_name": "Davis",
        "service_location": Point(-122.2364, 37.4852, srid=4326),
    },
]


class Command(BaseCommand):
    help = 'Seed the database with test users and dogs for DogGO'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("DogGO Seed Data Import")
        self.stdout.write("=" * 60)

        # Create owners
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
            self.stdout.write(
                f"[{status}] Owner: {user.username} ({data['first_name']} {data['last_name']})"
            )

        # Create dogs
        dogs_data = [
            {"owner": created_owners[0], "name": "Rover", "breed": "Husky", "size": "LARGE", "notes": "Likes to play fetch"},
            {"owner": created_owners[0], "name": "Bella", "breed": "Border Collie", "size": "MEDIUM", "notes": "Very energetic, needs lots of exercise"},
            {"owner": created_owners[1], "name": "Bob", "breed": "German Shepard", "size": "LARGE", "notes": "Loves to run, well-trained"},
            {"owner": created_owners[1], "name": "Daisy", "breed": "Labrador Retriever", "size": "LARGE", "notes": "Friendly with other dogs, gentle"},
            {"owner": created_owners[2], "name": "Charlie", "breed": "Beagle", "size": "SMALL", "notes": "Curious, follows nose everywhere"},
            {"owner": created_owners[3], "name": "Milo", "breed": "French Bulldog", "size": "SMALL", "notes": "Low energy, short walks are enough"},
            {"owner": created_owners[4], "name": "Luna", "breed": "Australian Shepherd", "size": "MEDIUM", "notes": "Intelligent, responds to commands"},
            {"owner": created_owners[4], "name": "Max", "breed": "Golden Retriever", "size": "LARGE", "notes": "Friendly with everyone, loves water"},
        ]

        for d in dogs_data:
            dog, created = Dog.objects.get_or_create(
                owner=d["owner"],
                name=d["name"],
                defaults={
                    "breed": d["breed"],
                    "size": d["size"],
                    "notes": d["notes"],
                }
            )
            status = "CREATED" if created else "EXISTING (skipped)"
            self.stdout.write(
                f"  [{status}] Dog: {dog.name} ({dog.breed}, {d['size']}) owned by {d['owner'].username}"
            )

        # Create walkers
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

            wp, created_profile = WalkerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "current_location": data["service_location"],
                    "is_online": True,
                    "max_dogs": 3,
                    "service_radius_km": 32.0,
                },
            )
            if not created_profile:
                wp.current_location = data["service_location"]
                wp.is_online = True
                wp.max_dogs = 3
                wp.service_radius_km = 32.0
                wp.save()

            status = "CREATED" if created else "EXISTING (updated)"
            self.stdout.write(
                f"[{status}] Walker: {user.username} ({data['first_name']} {data['last_name']})"
            )

        # Summary
        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("SEED DATA SUMMARY")
        self.stdout.write("=" * 60)
        self.stdout.write(f"Total Owners:      {len(created_owners)}")
        for o in created_owners:
            dog_count = Dog.objects.filter(owner=o).count()
            self.stdout.write(f"  - {o.username} ({o.email}) — {dog_count} dog(s)")

        walker_count = User.objects.filter(role='WALKER').count()
        self.stdout.write(f"Total Walkers:     {walker_count}")
        for w in User.objects.filter(role='WALKER'):
            wp = WalkerProfile.objects.get(user=w)
            
            self.stdout.write(
                f"  - {w.username} ({w.email}) — online={wp.is_online}, max_dogs={wp.max_dogs}"
            )

        self.stdout.write("")
        self.stdout.write("Credentials for ALL accounts:")
        self.stdout.write("  Password: Test1234 (same for every account)")
        self.stdout.write("=" * 60)
        self.stdout.write("")
        self.stdout.write("All Owner usernames: dogowner1, dogowner2, dogowner3, dogowner4, dogowner5")
        self.stdout.write("All Walker usernames: walker1, walker2, walker3")