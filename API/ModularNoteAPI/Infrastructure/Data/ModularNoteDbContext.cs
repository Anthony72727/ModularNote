using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    /// <summary>
    /// The EF Core DbContext of the ModularNote database
    /// </summary>
    public class ModularNoteDbContext : DbContext
    {
        /// <summary>
        /// Instantiate the DbContext
        /// </summary>
        /// <param name="options">The options of the context (provider, connection string), injected by dependency injection</param>
        public ModularNoteDbContext(DbContextOptions<ModularNoteDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// The notes table
        /// </summary>
        public DbSet<Note> Notes => Set<Note>();

        /// <summary>
        /// Configure the mapping between the entities and the tables
        /// </summary>
        /// <param name="modelBuilder">The builder of the EF Core model</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Note>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(Note.TitleMaxLength);
                entity.Property(e => e.Description).HasMaxLength(Note.DescriptionMaxLength);
                entity.Property(e => e.CreatedAt).IsRequired().HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
                entity.Property(e => e.UpdatedAt).HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
            });
        }
    }
}
