using AspNetCoreReactBeeAware.Server.Data;
using AspNetCoreReactBeeAware.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreReactBeeAware.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BeeKeepingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BeeKeepingController> _logger;

        public BeeKeepingController(AppDbContext context, ILogger<BeeKeepingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("apiaries")]
        public async Task<IActionResult> GetApiaries([FromQuery] int page = 1, [FromQuery] int pageSize = 6)
        {
            try
            {
                var apiaries = await _context.Apiaries
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.ApiaryId,
                        a.ApiaryName,
                        a.Address,      
                        a.ContactInfo,  
                        a.Notes,
                        a.Description,
                        HiveCount = _context.Hives.Count(h => h.ApiaryId == a.ApiaryId)
                    })
                    .ToListAsync();

                var totalApiaries = await _context.Apiaries.CountAsync();

                return Ok(new
                {
                    Apiaries = apiaries,
                    TotalCount = totalApiaries,
                    PageCount = (int)Math.Ceiling((double)totalApiaries / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching apiaries");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("hives/{apiaryId}")]
        public async Task<IActionResult> GetHives(int apiaryId, [FromQuery] int start = 0, [FromQuery] int count = 9)
        {
            _logger.LogInformation("GetHives called for apiaryId: {ApiaryId}, start: {Start}, count: {Count}", apiaryId, start, count);
            try
            {
                var hives = await _context.Hives
                    .Where(h => h.ApiaryId == apiaryId)
                    .Skip(start)
                    .Take(count)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} hives for apiaryId: {ApiaryId}", hives.Count, apiaryId);
                return Ok(hives);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching hives for apiaryId: {ApiaryId}", apiaryId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("hives/count/{apiaryId}")]
        public async Task<IActionResult> GetHiveCount(int apiaryId)
        {
            _logger.LogInformation("GetHiveCount called for apiaryId: {ApiaryId}", apiaryId);
            try
            {
                var count = await _context.Hives.CountAsync(h => h.ApiaryId == apiaryId);
                _logger.LogInformation("Hive count for apiaryId {ApiaryId}: {Count}", apiaryId, count);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching hive count for apiaryId: {ApiaryId}", apiaryId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("hives")]
        public async Task<IActionResult> AddHive([FromBody] Hive hive)
        {
            try
            {
                _context.Hives.Add(hive);
                await _context.SaveChangesAsync();
                return Ok(hive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding a new hive");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("hives/{hiveId}")]
        public async Task<IActionResult> UpdateHive(int hiveId, [FromBody] Hive hive)
        {
            if (hiveId != hive.HiveId)
                return BadRequest();

            try
            {
                _context.Entry(hive).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating hive with id: {HiveId}", hiveId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("hives/{hiveId}")]
        public async Task<IActionResult> DeleteHive(int hiveId)
        {
            try
            {
                var hive = await _context.Hives.FindAsync(hiveId);
                if (hive == null)
                {
                    return NotFound();
                }

                _context.Hives.Remove(hive);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting hive with id: {HiveId}", hiveId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("inspections/{hiveId}")]
        public async Task<IActionResult> GetInspections(int hiveId, [FromQuery] DateTime? date)
        {
            try
            {
                var query = _context.Inspections.Where(i => i.HiveId == hiveId);

                if (date.HasValue)
                {
                    // Compare only the date part, ignoring time
                    var requestedDate = date.Value.Date;
                    query = query.Where(i => i.InspectionDate.Date == requestedDate);
                }

                var inspections = await query.OrderByDescending(i => i.InspectionDate)
                                           .Take(5)
                                           .ToListAsync();

                return Ok(inspections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching inspections for hiveId: {HiveId}", hiveId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("diseases/{inspectionId}")]
        public async Task<IActionResult> GetDiseases(int inspectionId)
        {
            try
            {
                var diseases = await _context.Diseases
                                             .Where(d => d.InspectionId == inspectionId)
                                             .ToListAsync();

                return Ok(diseases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching diseases for inspectionId: {InspectionId}", inspectionId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("inspections")]
        public async Task<IActionResult> AddInspection([FromBody] Inspection inspection)
        {
            try
            {
                _context.Inspections.Add(inspection);
                await _context.SaveChangesAsync();
                return Ok(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding a new inspection");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("diseases")]
        public async Task<IActionResult> AddDisease([FromBody] Disease disease)
        {
            try
            {
                _context.Diseases.Add(disease);
                await _context.SaveChangesAsync();
                return Ok(disease);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding a new disease");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("apiaries/{id}")]
        public async Task<IActionResult> UpdateApiary(int id, [FromBody] Apiary apiary)
        {
            if (id != apiary.ApiaryId)
            {
                return BadRequest("The ID in the URL does not match the ID in the request body.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Entry(apiary).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApiaryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating apiary with id: {ApiaryId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        private bool ApiaryExists(int id)
        {
            return _context.Apiaries.Any(e => e.ApiaryId == id);
        }

        [HttpPost("apiaries")]
        public async Task<IActionResult> CreateApiary([FromBody] Apiary apiary)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation("Received apiary: {@Apiary}", apiary);

                // Ensure ApiaryId is not set for new hives
                foreach (var hive in apiary.Hives)
                {
                    hive.ApiaryId = 0;
                }

                _context.Apiaries.Add(apiary);
                await _context.SaveChangesAsync();

                var createdApiary = new
                {
                    apiaryId = apiary.ApiaryId,
                    apiaryName = apiary.ApiaryName,
                    hiveCount = apiary.Hives?.Count ?? 0
                };

                _logger.LogInformation("Created apiary: {@CreatedApiary}", createdApiary);
                return Ok(createdApiary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a new apiary");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("apiaries/{id}")]
        public async Task<IActionResult> DeleteApiary(int id)
        {
            try
            {
                var apiary = await _context.Apiaries.FindAsync(id);
                if (apiary == null)
                    return NotFound();

                _context.Apiaries.Remove(apiary);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting apiary with id: {ApiaryId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}