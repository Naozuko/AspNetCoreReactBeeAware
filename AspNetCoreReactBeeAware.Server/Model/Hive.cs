namespace AspNetCoreReactBeeAware.Server.Models
{
    public class Hive
    {
        public int HiveId { get; set; }
        public string HiveNumber { get; set; } = string.Empty;
        public int ApiaryId { get; set; }
        public bool QueenExcluder { get; set; } = false;
        public int FrameCount { get; set; } = 10; // Set a default value, adjust as needed
        public bool BeetleTrap { get; set; } = false;
        public string? Comments { get; set; }
        public Apiary? Apiary { get; set; }
    }
}