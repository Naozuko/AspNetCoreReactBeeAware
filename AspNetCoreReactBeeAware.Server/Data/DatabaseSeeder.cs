using AspNetCoreReactBeeAware.Server.Models;
using System;
using System.Linq;

namespace AspNetCoreReactBeeAware.Server.Data
{
    public static class DatabaseSeeder
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Apiaries.Any())
            {
                Console.WriteLine("Seeding database...");
                SeedApiariesAndHives(context);
                SeedInspectionsAndDiseases(context);
                Console.WriteLine("Database seeding completed.");
            }
            else
            {
                Console.WriteLine("Database already contains data. Skipping seeding.");
            }
        }

        private static void SeedApiariesAndHives(AppDbContext context)
        {
            var apiaries = new[]
            {
                new Apiary { ApiaryName = "Apiary1" },
                new Apiary { ApiaryName = "Apiary2" },
                new Apiary { ApiaryName = "Apiary3" }
            };

            context.Apiaries.AddRange(apiaries);
            context.SaveChanges();

            foreach (var apiary in apiaries)
            {
                var hives = new[]
                {
                    new Hive {
                        HiveNumber = $"{apiary.ApiaryName}_Hive1",
                        ApiaryId = apiary.ApiaryId,
                        QueenExcluder = true,
                        FrameCount = 10,
                        BeetleTrap = false,
                        Comments = $"{apiary.ApiaryName}_Hive1_Comments: Healthy hive"
                    },
                    new Hive {
                        HiveNumber = $"{apiary.ApiaryName}_Hive2",
                        ApiaryId = apiary.ApiaryId,
                        QueenExcluder = false,
                        FrameCount = 8,
                        BeetleTrap = true,
                        Comments = $"{apiary.ApiaryName}_Hive2_Comments: Needs inspection"
                    },
                    new Hive {
                        HiveNumber = $"{apiary.ApiaryName}_Hive3",
                        ApiaryId = apiary.ApiaryId,
                        QueenExcluder = true,
                        FrameCount = 9,
                        BeetleTrap = true,
                        Comments = $"{apiary.ApiaryName}_Hive3_Comments: New queen introduced"
                    }
                };

                context.Hives.AddRange(hives);
            }

            context.SaveChanges();
            Console.WriteLine($"Seeded {apiaries.Length} apiaries with hives.");
        }

        private static void SeedInspectionsAndDiseases(AppDbContext context)
        {
            var today = DateTime.Today;
            var hives = context.Hives.ToList();
            string[] broodPatterns = { "Scattered", "Solid", "Spotty", "Irregular", "Consistent" };
            string[] honeyPatterns = { "Capped", "Uncapped", "Mixed", "Partial", "Full" };
            string[] temperaments = { "Calm", "Aggressive", "Defensive", "Docile", "Irritable" };
            string[] diseases = { "Varroa Mites", "American Foulbrood", "European Foulbrood", "Nosema", "Chalkbrood" };
            string[] severities = { "Mild", "Moderate", "Severe", "Critical", "Negligible" };

            foreach (var hive in hives)
            {
                for (int i = 0; i < 5; i++)
                {
                    var inspection = new Inspection
                    {
                        HiveId = hive.HiveId,
                        InspectionDate = today.AddDays(-i),
                        BroodFrames = 5 - i,
                        BroodPattern = broodPatterns[i],
                        HoneyFrames = i,
                        HoneyPattern = honeyPatterns[i],
                        EggFrames = (5 - i) / 2,
                        EggPattern = broodPatterns[(i + 2) % 5],
                        EmptyFrames = i,
                        Temperament = temperaments[i],
                        Comments = $"Day {i + 1} inspection for {hive.HiveNumber}",
                        NextInspectionDate = today.AddDays(7 - i)
                    };

                    context.Inspections.Add(inspection);
                    context.SaveChanges();

                    if (i % 2 == 0) // Add disease for every other inspection
                    {
                        var disease = new Disease
                        {
                            InspectionId = inspection.InspectionId,
                            DiseaseName = diseases[i],
                            Severity = severities[i],
                            Description = $"Day {i + 1} disease observation in {hive.HiveNumber}",
                            ImageUrl = $"http://example.com/disease_image_{i + 1}.jpg" // Dummy URL
                        };

                        context.Diseases.Add(disease);
                    }
                }
            }

            context.SaveChanges();
            Console.WriteLine("Seeded inspections and diseases.");
        }
    }
}