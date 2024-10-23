using Microsoft.EntityFrameworkCore;
using AspNetCoreReactBeeAware.Server.Models;


namespace AspNetCoreReactBeeAware.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Apiary> Apiaries { get; set; }
        public DbSet<Hive> Hives { get; set; }
        public DbSet<Inspection> Inspections { get; set; }
        public DbSet<Disease> Diseases { get; set; }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Apiary
            modelBuilder.Entity<Apiary>(entity =>
            {
                entity.HasKey(e => e.ApiaryId);
                entity.Property(e => e.ApiaryName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.ContactInfo).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasMany(a => a.Hives)
                      .WithOne(h => h.Apiary)
                      .HasForeignKey(h => h.ApiaryId);
            });

            // Configure Hive
            modelBuilder.Entity<Hive>(entity =>
            {
                entity.HasKey(e => e.HiveId);
                entity.Property(e => e.HiveNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Comments).HasMaxLength(500);
                entity.HasOne(h => h.Apiary)
                      .WithMany(a => a.Hives)
                      .HasForeignKey(h => h.ApiaryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Inspection
            modelBuilder.Entity<Inspection>(entity =>
            {
                entity.HasKey(e => e.InspectionId);
                entity.Property(e => e.BroodPattern).HasMaxLength(100);
                entity.Property(e => e.HoneyPattern).HasMaxLength(100);
                entity.Property(e => e.EggPattern).HasMaxLength(100);
                entity.Property(e => e.Temperament).HasMaxLength(50);
                entity.Property(e => e.Comments).HasMaxLength(500);

                entity.HasOne(i => i.Hive)
                      .WithMany()
                      .HasForeignKey(i => i.HiveId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Disease
            modelBuilder.Entity<Disease>(entity =>
            {
                entity.HasKey(e => e.DiseaseId);
                entity.Property(e => e.DiseaseName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Severity).HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.ImageUrl).HasMaxLength(255);

                entity.HasOne(d => d.Inspection)
                      .WithMany()
                      .HasForeignKey(d => d.InspectionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}