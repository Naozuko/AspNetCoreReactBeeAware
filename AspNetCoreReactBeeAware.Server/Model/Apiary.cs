using AspNetCoreReactBeeAware.Server.Models;

public class Apiary
{
    public int ApiaryId { get; set; }
    public string ApiaryName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? ContactInfo { get; set; }
    public string? Notes { get; set; }
    public string? Description { get; set; }
    public List<Hive> Hives { get; set; } = new List<Hive>();
}