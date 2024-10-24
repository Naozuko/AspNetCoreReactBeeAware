﻿// <auto-generated />
using System;
using AspNetCoreReactBeeAware.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace AspNetCoreReactBeeAware.Server.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20241015070944_AddUserTable")]
    partial class AddUserTable
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.8");

            modelBuilder.Entity("Apiary", b =>
                {
                    b.Property<int>("ApiaryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Address")
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<string>("ApiaryName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("ContactInfo")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<string>("Notes")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.HasKey("ApiaryId");

                    b.ToTable("Apiaries");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Disease", b =>
                {
                    b.Property<int>("DiseaseId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<string>("DiseaseName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("ImageUrl")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<int>("InspectionId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Severity")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.HasKey("DiseaseId");

                    b.HasIndex("InspectionId");

                    b.ToTable("Diseases");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Hive", b =>
                {
                    b.Property<int>("HiveId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("ApiaryId")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("BeetleTrap")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Comments")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<int>("FrameCount")
                        .HasColumnType("INTEGER");

                    b.Property<string>("HiveNumber")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<bool>("QueenExcluder")
                        .HasColumnType("INTEGER");

                    b.HasKey("HiveId");

                    b.HasIndex("ApiaryId");

                    b.ToTable("Hives");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Inspection", b =>
                {
                    b.Property<int>("InspectionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("BroodFrames")
                        .HasColumnType("INTEGER");

                    b.Property<string>("BroodPattern")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Comments")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<int>("EggFrames")
                        .HasColumnType("INTEGER");

                    b.Property<string>("EggPattern")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<int>("EmptyFrames")
                        .HasColumnType("INTEGER");

                    b.Property<int>("HiveId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("HoneyFrames")
                        .HasColumnType("INTEGER");

                    b.Property<string>("HoneyPattern")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("InspectionDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("NextInspectionDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Temperament")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.HasKey("InspectionId");

                    b.HasIndex("HiveId");

                    b.ToTable("Inspections");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<byte[]>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("BLOB");

                    b.Property<byte[]>("PasswordSalt")
                        .IsRequired()
                        .HasColumnType("BLOB");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Disease", b =>
                {
                    b.HasOne("AspNetCoreReactBeeAware.Server.Models.Inspection", "Inspection")
                        .WithMany()
                        .HasForeignKey("InspectionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Inspection");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Hive", b =>
                {
                    b.HasOne("Apiary", "Apiary")
                        .WithMany("Hives")
                        .HasForeignKey("ApiaryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Apiary");
                });

            modelBuilder.Entity("AspNetCoreReactBeeAware.Server.Models.Inspection", b =>
                {
                    b.HasOne("AspNetCoreReactBeeAware.Server.Models.Hive", "Hive")
                        .WithMany()
                        .HasForeignKey("HiveId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Hive");
                });

            modelBuilder.Entity("Apiary", b =>
                {
                    b.Navigation("Hives");
                });
#pragma warning restore 612, 618
        }
    }
}
