from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ProjectResponse(BaseModel):
    """Read-only project response — serialised with camelCase keys."""

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: int
    slug: str
    title: str
    project_type: str
    year: int
    description: str
    tags: list[str]
    github_url: str
    display_order: int
    is_featured: bool
