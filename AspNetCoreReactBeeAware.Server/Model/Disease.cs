namespace AspNetCoreReactBeeAware.Server.Models
{
    public class Disease
    {
        public int DiseaseId { get; set; }
        public int InspectionId { get; set; }
        public string? DiseaseName { get; set; }
        public string? Severity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }

        public Inspection? Inspection { get; set; }
    }
}