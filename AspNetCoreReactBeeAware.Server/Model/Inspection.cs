namespace AspNetCoreReactBeeAware.Server.Models
{
    public class Inspection
    {
        public int InspectionId { get; set; }
        public int HiveId { get; set; }
        public DateTime InspectionDate { get; set; }
        public int BroodFrames { get; set; }
        public string? BroodPattern { get; set; }
        public int HoneyFrames { get; set; }
        public string? HoneyPattern { get; set; }
        public int EggFrames { get; set; }
        public string? EggPattern { get; set; }
        public int EmptyFrames { get; set; }
        public string? Temperament { get; set; }
        public string? Comments { get; set; }
        public DateTime NextInspectionDate { get; set; }

        public Hive? Hive { get; set; }
    }
}
