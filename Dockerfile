# Build React client
FROM node:18 AS client-build
WORKDIR /src/client
COPY aspnetcorereactbeeaware.client/package*.json ./
RUN npm install
COPY aspnetcorereactbeeaware.client/ ./
RUN npm run build

# Build .NET server
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AspNetCoreReactBeeAware.Server/AspNetCoreReactBeeAware.Server.csproj", "AspNetCoreReactBeeAware.Server/"]
RUN dotnet restore "AspNetCoreReactBeeAware.Server/AspNetCoreReactBeeAware.Server.csproj"
COPY AspNetCoreReactBeeAware.Server/ ./AspNetCoreReactBeeAware.Server/
WORKDIR "/src/AspNetCoreReactBeeAware.Server"
RUN dotnet build "AspNetCoreReactBeeAware.Server.csproj" -c Release -o /app/build

# Publish .NET application
FROM build AS publish
RUN dotnet publish "AspNetCoreReactBeeAware.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=client-build /src/client/dist ./wwwroot

# Expose the port the app will run on
EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "AspNetCoreReactBeeAware.Server.dll"]