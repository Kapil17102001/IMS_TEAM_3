FROM postgres:15

# Set environment variables
ENV POSTGRES_DB=Intern_Database
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV TZ=Asia/Kolkata

# Expose PostgreSQL port
EXPOSE 5432

# PostgreSQL data directory (handled internally by image)
VOLUME ["/var/lib/postgresql/data"]
